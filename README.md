# LiveCost

Real-Time Cost of Living Intelligence

A machine learning-powered web application that predicts personalized cost of living based on lifestyle preferences and location.

## Project Overview

LiveCost helps users estimate their monthly living expenses across major US cities by analyzing 8 lifestyle factors plus location and salary data. The app uses a Random Forest regression model trained on cost of living data to provide personalized predictions.

## Features

- **8 Lifestyle Questions**: Apartment size, dining habits, vehicle type, commute distance, entertainment budget, grocery preferences, fitness routine, and healthcare needs
- **10 US Cities**: NYC, LA, Chicago, Austin, Miami, Seattle, Boston, Denver, Dallas, Phoenix
- **ML Predictions**: RandomForestRegressor model for cost estimation
- **Cost Breakdown**: Visual breakdown by category (rent, food, transportation, utilities, etc.)
- **Affordability Map**: Interactive US map with color-coded affordability based on salary
- **Chart Visualization**: Bar chart showing expense distribution

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- Chart.js / react-chartjs-2
- react-simple-maps

### Backend
- Python 3.x
- FastAPI
- scikit-learn (RandomForestRegressor)
- SQLite (caching layer)
- Pydantic (validation)

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python train_model.py  # Train the ML model
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

The app will be available at http://localhost:3000

## Project Structure

```
livecost/
├── backend/
│   ├── main.py              # FastAPI REST API
│   ├── train_model.py       # ML model training
│   ├── database.py          # SQLite caching layer
│   ├── livecost_model.pkl   # Trained model
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.js           # Main component
│       └── components/
│           ├── CostForm.js        # Input form
│           ├── Results.js         # Prediction display
│           ├── CostChart.js       # Bar chart
│           └── AffordabilityMap.js # US map
└── data/
    └── cost_of_living_data.csv    # Training data
```

## Author

Jeremiah Williams
Project & Portfolio IV - Full Sail University
December 2025
