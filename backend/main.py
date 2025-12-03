"""
LiveCost FastAPI Backend - main.py

REST API for cost of living predictions. This is the heart of the backend -
handles all the HTTP requests from the React frontend.

I went with FastAPI over Flask because:
- The automatic docs at /docs are super helpful for testing
- Built-in validation with Pydantic saves a ton of error handling code
- It's what we covered in the API development module

Author: Jeremiah Williams
Course: Project & Portfolio IV - Full Sail University
Date: December 2025
"""

# FastAPI stuff
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Pydantic for validation - this was a lifesaver for catching bad input
from pydantic import BaseModel, Field, field_validator

from typing import Optional, Dict, List, Literal
import joblib
import json
import os
import numpy as np
import httpx
from datetime import datetime

# My database module - kept it separate to stay organized
from database import (
    init_database,
    save_user_query,
    get_cached_api_response,
    cache_api_response,
    get_recent_queries,
    get_query_statistics
)


# Set up the FastAPI app with some basic info for the docs page
app = FastAPI(
    title="LiveCost API",
    description="Real-Time Cost of Living Intelligence API",
    version="1.0.0"
)

# CORS setup - spent way too long debugging this the first time
# Without this, React can't talk to FastAPI because of browser security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Where the script lives - need this for finding model files
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Global vars for the ML models - load once, use everywhere
model = None
breakdown_models = None
metadata = None


def load_models():
    """
    Load the trained ML models from disk.

    These get loaded once when the server starts. Tried loading them
    per-request at first and it was way too slow (~100ms each time).
    """
    global model, breakdown_models, metadata

    model_path = os.path.join(SCRIPT_DIR, 'livecost_model.pkl')
    breakdown_path = os.path.join(SCRIPT_DIR, 'breakdown_models.pkl')
    metadata_path = os.path.join(SCRIPT_DIR, 'model_metadata.json')

    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("Main model loaded successfully")

    if os.path.exists(breakdown_path):
        breakdown_models = joblib.load(breakdown_path)
        print("Breakdown models loaded successfully")

    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        print("Metadata loaded successfully")


@app.on_event("startup")
async def startup_event():
    """Runs when server starts - set up DB and load models."""
    init_database()
    load_models()
    print("LiveCost API started successfully!")


# ---- Request/Response Models ----
# Pydantic handles all the validation automatically which is nice

class PredictionRequest(BaseModel):
    """
    All the inputs from the form.

    Using Literal types to restrict to valid options - learned this
    from the FastAPI docs. Keeps bad data from getting to the model.
    """
    city: Literal['NYC', 'LA', 'Chicago', 'Austin', 'Miami',
                  'Seattle', 'Boston', 'Denver', 'Dallas', 'Phoenix']

    # The 8 lifestyle questions
    apartment_size: Literal['studio', '1BR', '2BR', '3BR']
    dining_frequency: int = Field(..., ge=0, le=15,
                                  description="Times dining out per week")
    car_type: Literal['compact', 'sedan', 'suv', 'electric']
    commute_miles: float = Field(..., ge=0, le=100,
                                 description="Daily round-trip commute")
    entertainment_budget: Literal['low', 'moderate', 'high'] = 'moderate'
    grocery_habits: Literal['budget', 'moderate', 'premium'] = 'moderate'
    fitness_routine: Literal['none', 'home', 'gym'] = 'none'
    healthcare_needs: Literal['minimal', 'standard', 'comprehensive'] = 'standard'

    @field_validator('dining_frequency')
    @classmethod
    def validate_dining(cls, v):
        """Extra validation just to be safe."""
        if v < 0 or v > 15:
            raise ValueError('Dining frequency must be between 0 and 15')
        return v


# Cost lookup tables for the lifestyle-based categories
# These don't need ML since they're pretty consistent across cities
ENTERTAINMENT_COSTS = {
    'low': 75,       # Netflix and chill basically
    'moderate': 175, # Going out sometimes
    'high': 350      # Living it up
}

GROCERY_COSTS = {
    'budget': 250,   # Walmart/Aldi
    'moderate': 400, # Regular grocery stores
    'premium': 600   # Whole Foods (RIP wallet)
}

FITNESS_COSTS = {
    'none': 0,
    'home': 30,      # YouTube workouts + maybe some dumbbells
    'gym': 75        # Average gym membership
}

HEALTHCARE_COSTS = {
    'minimal': 50,
    'standard': 150,
    'comprehensive': 300
}


class CostBreakdown(BaseModel):
    """The 8 cost categories that match our inputs."""
    rent: float
    food: float
    transportation: float
    utilities: float
    entertainment: float
    groceries: float
    fitness: float
    healthcare: float


class PredictionResponse(BaseModel):
    """What we send back to the frontend."""
    city: str
    total_monthly_cost: float
    breakdown: CostBreakdown
    confidence: str
    input_summary: Dict
    query_id: int
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    database_ready: bool
    timestamp: str


class CitiesResponse(BaseModel):
    cities: List[str]
    count: int


# City cost multipliers
# In a real app these would come from Zillow/Numbeo APIs
# but for the proof of concept I'm using realistic estimates
# TODO: integrate real APIs for final version
CITY_COST_MULTIPLIERS = {
    'NYC': {'rent': 1.4, 'food': 1.3, 'transport': 1.2, 'utilities': 1.1},
    'LA': {'rent': 1.2, 'food': 1.15, 'transport': 1.3, 'utilities': 1.0},
    'Chicago': {'rent': 0.95, 'food': 1.0, 'transport': 0.9, 'utilities': 1.05},
    'Austin': {'rent': 0.9, 'food': 0.95, 'transport': 1.0, 'utilities': 0.9},
    'Miami': {'rent': 1.05, 'food': 1.1, 'transport': 1.0, 'utilities': 1.0},
    'Seattle': {'rent': 1.15, 'food': 1.1, 'transport': 1.05, 'utilities': 0.95},
    'Boston': {'rent': 1.25, 'food': 1.15, 'transport': 1.0, 'utilities': 1.1},
    'Denver': {'rent': 0.95, 'food': 1.0, 'transport': 1.05, 'utilities': 0.95},
    'Dallas': {'rent': 0.85, 'food': 0.9, 'transport': 1.1, 'utilities': 0.85},
    'Phoenix': {'rent': 0.8, 'food': 0.85, 'transport': 1.15, 'utilities': 1.0}
}


async def get_city_cost_data(city: str) -> Dict:
    """
    Get cost data for a city, checking cache first.

    This is where real API calls would go. The caching pattern
    would be the same - check SQLite first, call API if needed,
    then cache the result.
    """
    cache_key = f"city_costs_{city}"

    # Try cache first
    cached = get_cached_api_response(cache_key)
    if cached:
        print(f"Cache hit for {city}")
        return cached

    print(f"Cache miss for {city} - fetching data")

    # Would be an API call in production
    cost_data = CITY_COST_MULTIPLIERS.get(city, {
        'rent': 1.0, 'food': 1.0, 'transport': 1.0, 'utilities': 1.0
    })

    # Save to cache
    cache_api_response(cache_key, cost_data)

    return cost_data


def encode_input(request: PredictionRequest) -> np.ndarray:
    """
    Convert the form inputs into numbers for the ML model.

    The model was trained with specific encodings (studio=3, 1BR=0, etc.)
    so we have to use the exact same ones here. Took me a while to
    figure out why predictions were weird before I realized this.
    """
    if metadata is None:
        raise HTTPException(status_code=500, detail="Model metadata not loaded")

    encoders = metadata['encoders']

    # Use the saved mappings from training
    city_encoded = encoders['city']['mapping'].get(request.city, 0)
    apartment_encoded = encoders['apartment_size']['mapping'].get(request.apartment_size, 0)
    car_encoded = encoders['car_type']['mapping'].get(request.car_type, 0)

    # Has to be in the same order as training
    features = np.array([[
        city_encoded,
        apartment_encoded,
        request.dining_frequency,
        car_encoded,
        request.commute_miles
    ]])

    return features


# ---- API Endpoints ----

@app.get("/", response_model=HealthResponse)
async def root():
    """Basic health check."""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        database_ready=True,
        timestamp=datetime.now().isoformat()
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """More detailed health check."""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None and breakdown_models is not None,
        database_ready=True,
        timestamp=datetime.now().isoformat()
    )


@app.get("/cities", response_model=CitiesResponse)
async def get_cities():
    """Return available cities for the dropdown."""
    cities = ['NYC', 'LA', 'Chicago', 'Austin', 'Miami',
              'Seattle', 'Boston', 'Denver', 'Dallas', 'Phoenix']
    return CitiesResponse(cities=cities, count=len(cities))


@app.post("/predict", response_model=PredictionResponse)
async def predict_cost(request: PredictionRequest):
    """
    Main prediction endpoint - this is where the magic happens.

    Takes all the form inputs, runs them through the ML model,
    adds in the lifestyle-based costs, and returns the breakdown.
    """
    if model is None or breakdown_models is None:
        raise HTTPException(
            status_code=500,
            detail="Models not loaded. Run train_model.py first."
        )

    try:
        # Encode inputs for the model
        features = encode_input(request)

        # Get city multipliers (checks cache)
        city_costs = await get_city_cost_data(request.city)

        # Run predictions for each category
        total_prediction = float(model.predict(features)[0])

        breakdown = {}
        for category, cat_model in breakdown_models.items():
            base_prediction = float(cat_model.predict(features)[0])

            # Apply city multiplier
            multiplier_key = 'transport' if category == 'transportation' else category
            multiplier = city_costs.get(multiplier_key, 1.0)

            breakdown[category] = round(base_prediction * multiplier, 2)

        # Add the lifestyle-based costs (these use the lookup tables)
        breakdown['entertainment'] = round(
            ENTERTAINMENT_COSTS.get(request.entertainment_budget, 175) *
            city_costs.get('food', 1.0),
            2
        )

        breakdown['groceries'] = round(
            GROCERY_COSTS.get(request.grocery_habits, 400) *
            city_costs.get('food', 1.0),
            2
        )

        breakdown['fitness'] = round(
            FITNESS_COSTS.get(request.fitness_routine, 0) *
            city_costs.get('utilities', 1.0),
            2
        )

        breakdown['healthcare'] = round(
            HEALTHCARE_COSTS.get(request.healthcare_needs, 150) *
            city_costs.get('utilities', 1.0),
            2
        )

        # Total it up
        breakdown_total = sum(breakdown.values())

        # Figure out confidence based on model R² score
        r2_score = metadata['metrics']['test']['r2'] if metadata else 0.8

        if r2_score > 0.9:
            confidence = "High"
        elif r2_score > 0.75:
            confidence = "Medium"
        else:
            confidence = "Low"  # Our model is here unfortunately

        # Save to database for analytics
        query_id = save_user_query(
            city=request.city,
            apartment_size=request.apartment_size,
            dining_frequency=request.dining_frequency,
            car_type=request.car_type,
            commute_miles=request.commute_miles,
            predicted_cost=breakdown_total,
            breakdown=breakdown
        )

        return PredictionResponse(
            city=request.city,
            total_monthly_cost=round(breakdown_total, 2),
            breakdown=CostBreakdown(**breakdown),
            confidence=confidence,
            input_summary={
                "apartment_size": request.apartment_size,
                "dining_frequency": f"{request.dining_frequency}x/week",
                "car_type": request.car_type,
                "commute_miles": f"{request.commute_miles} miles/day",
                "entertainment": request.entertainment_budget,
                "groceries": request.grocery_habits,
                "fitness": request.fitness_routine,
                "healthcare": request.healthcare_needs
            },
            query_id=query_id,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/statistics")
async def get_statistics():
    """Get query statistics - useful for analytics."""
    stats = get_query_statistics()
    return stats


@app.get("/recent-queries")
async def get_recent():
    """Get recent predictions - could use this for a history feature."""
    queries = get_recent_queries(limit=10)
    return {"queries": queries}


@app.get("/model-info")
async def get_model_info():
    """Return info about the model - helps with debugging."""
    if metadata is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    return {
        "metrics": metadata['metrics'],
        "features": metadata['feature_cols'],
        "categories": metadata['categories'],
        "encoders": {
            k: v['classes'] for k, v in metadata['encoders'].items()
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
