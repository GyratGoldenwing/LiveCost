"""
LiveCost ML Model Training Script - train_model.py

This trains the machine learning models that power the cost predictions.
Run this whenever you update the training data or want to retrain.

I picked RandomForestRegressor after trying a few options:
- Linear regression was too simple, couldn't capture the patterns
- Neural network felt like overkill for 70 data points
- Random Forest hit the sweet spot - handles mixed data types well
  and doesn't need feature scaling

Usage: python train_model.py

Author: Jeremiah Williams
Course: Project & Portfolio IV - Full Sail University
Date: December 2025
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import json
import os

# Figure out where this script lives so we can find the data
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'data')


def load_and_preprocess_data():
    """
    Load the training data from CSV.

    Using CSV because it's simple and easy to edit if I need to
    add more data points later. For a bigger project I'd probably
    use a real database.
    """
    csv_path = os.path.join(DATA_DIR, 'cost_of_living_data.csv')
    df = pd.read_csv(csv_path)

    print(f"Dataset loaded: {len(df)} records")
    print(f"Features: {df.columns.tolist()}")
    print(f"\nCities in dataset: {df['city'].unique().tolist()}")

    return df


def encode_features(df):
    """
    Convert text categories to numbers for the ML model.

    ML models need numbers, not strings like 'studio' or 'Austin'.
    LabelEncoder converts each unique value to an integer.

    Important: we save these mappings so the API can encode new
    predictions the same way. If the encoding doesn't match,
    predictions will be totally wrong (learned this the hard way).
    """
    encoders = {}
    df_encoded = df.copy()

    # These are the columns we need to encode
    categorical_cols = ['city', 'apartment_size', 'car_type']

    for col in categorical_cols:
        le = LabelEncoder()
        df_encoded[f'{col}_encoded'] = le.fit_transform(df[col])

        # Save the mapping for later
        encoders[col] = {
            'classes': le.classes_.tolist(),
            'mapping': {cls: idx for idx, cls in enumerate(le.classes_)}
        }

        print(f"\n{col} encoding: {encoders[col]['mapping']}")

    return df_encoded, encoders


def train_model(df_encoded):
    """
    Train the main prediction model.

    Using 80/20 train/test split which is pretty standard.
    random_state=42 makes it reproducible (the 42 is just a convention,
    it's a Hitchhiker's Guide reference apparently).
    """
    # Features the model will use
    feature_cols = [
        'city_encoded',
        'apartment_size_encoded',
        'dining_frequency',
        'car_type_encoded',
        'commute_miles'
    ]

    X = df_encoded[feature_cols]
    y = df_encoded['total_monthly_cost']

    # Split into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42
    )

    print(f"\nTraining set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")

    # Train the model
    # n_estimators=100 means 100 trees in the forest
    # max_depth=10 prevents overfitting on our small dataset
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1  # Use all CPU cores
    )

    model.fit(X_train, y_train)

    # See how well it did
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)

    metrics = {
        'train': {
            'rmse': float(np.sqrt(mean_squared_error(y_train, y_pred_train))),
            'r2': float(r2_score(y_train, y_pred_train)),
            'mae': float(mean_absolute_error(y_train, y_pred_train))
        },
        'test': {
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred_test))),
            'r2': float(r2_score(y_test, y_pred_test)),
            'mae': float(mean_absolute_error(y_test, y_pred_test))
        }
    }

    # Print out how we did
    print("\n" + "="*50)
    print("MODEL EVALUATION")
    print("="*50)
    print(f"\nTraining Set:")
    print(f"  RMSE: ${metrics['train']['rmse']:.2f}")
    print(f"  R² Score: {metrics['train']['r2']:.4f}")
    print(f"  MAE: ${metrics['train']['mae']:.2f}")
    print(f"\nTest Set:")
    print(f"  RMSE: ${metrics['test']['rmse']:.2f}")
    print(f"  R² Score: {metrics['test']['r2']:.4f}")
    print(f"  MAE: ${metrics['test']['mae']:.2f}")

    # The R² is lower than I'd like (~0.44) but that's because we only
    # have 70 data points. More data would help a lot.

    # Check which features matter most
    importance = dict(zip(feature_cols, model.feature_importances_))

    print("\nFeature Importance:")
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feat}: {imp:.4f}")

    return model, metrics, feature_cols


def train_breakdown_models(df_encoded):
    """
    Train separate models for rent, food, transportation, utilities.

    This way we can show users a detailed breakdown instead of just
    one total number. Each model is simpler since it's predicting
    less variance.
    """
    feature_cols = [
        'city_encoded',
        'apartment_size_encoded',
        'dining_frequency',
        'car_type_encoded',
        'commute_miles'
    ]

    X = df_encoded[feature_cols]
    breakdown_models = {}
    categories = ['rent', 'food', 'transportation', 'utilities']

    print("\n" + "="*50)
    print("TRAINING BREAKDOWN MODELS")
    print("="*50)

    for category in categories:
        y = df_encoded[category]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Simpler models for individual categories
        model = RandomForestRegressor(
            n_estimators=50,
            max_depth=8,
            random_state=42,
            n_jobs=-1
        )

        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        r2 = r2_score(y_test, y_pred)

        breakdown_models[category] = model

        print(f"  {category.capitalize()} model R²: {r2:.4f}")

    return breakdown_models


def save_artifacts(model, breakdown_models, encoders, metrics, feature_cols):
    """
    Save everything to disk so the API can use it.

    Using joblib for the models (better than pickle for sklearn)
    and JSON for the metadata (human readable, easy to debug).
    """
    # Save main model
    model_path = os.path.join(SCRIPT_DIR, 'livecost_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nMain model saved to: {model_path}")

    # Save breakdown models
    breakdown_path = os.path.join(SCRIPT_DIR, 'breakdown_models.pkl')
    joblib.dump(breakdown_models, breakdown_path)
    print(f"Breakdown models saved to: {breakdown_path}")

    # Save metadata (encoders, metrics, etc.)
    metadata = {
        'encoders': encoders,
        'metrics': metrics,
        'feature_cols': feature_cols,
        'categories': ['rent', 'food', 'transportation', 'utilities']
    }

    metadata_path = os.path.join(SCRIPT_DIR, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {metadata_path}")


def main():
    """Run the full training pipeline."""
    print("="*50)
    print("LIVECOST ML MODEL TRAINING")
    print("="*50)

    # Load data
    df = load_and_preprocess_data()

    # Encode categorical features
    df_encoded, encoders = encode_features(df)

    # Train main model
    model, metrics, feature_cols = train_model(df_encoded)

    # Train breakdown models
    breakdown_models = train_breakdown_models(df_encoded)

    # Save everything
    save_artifacts(model, breakdown_models, encoders, metrics, feature_cols)

    print("\n" + "="*50)
    print("TRAINING COMPLETE!")
    print("="*50)


if __name__ == '__main__':
    main()
