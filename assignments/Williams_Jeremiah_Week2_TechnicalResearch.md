# LiveCost: Technical Research & Development Document

**Author:** Jeremiah Williams
**Course:** Project & Portfolio IV - Full Sail University
**Date:** December 2025

---

## Introduction

LiveCost is a real-time cost of living intelligence application designed to help users estimate personalized monthly expenses across major US cities. The application combines machine learning predictions with lifestyle-based cost calculations to provide accurate, actionable financial insights. This document outlines the technology stack, research findings, development process, and lessons learned during the R&D phase.

## Technology Overview

### Machine Learning: scikit-learn with RandomForestRegressor

The core prediction engine uses scikit-learn's RandomForestRegressor algorithm. Random Forest was selected after evaluating several alternatives:

- **Linear Regression:** Too simplistic for capturing non-linear relationships between lifestyle factors and costs
- **Neural Networks:** Excessive complexity for a dataset of 70 records; risk of overfitting
- **Gradient Boosting:** Comparable performance but longer training times

Random Forest provides several advantages for this use case: it handles mixed categorical and numerical features without extensive preprocessing, provides feature importance metrics for interpretability, and maintains robust performance with limited training data (Breiman, 2001).

The current model achieves an R² score of approximately 0.44 on the test set. While this indicates room for improvement, the limited dataset size is the primary constraint. Additional data collection would significantly improve prediction accuracy.

### Backend: FastAPI with Pydantic

FastAPI was chosen as the backend framework for its automatic API documentation, built-in request validation through Pydantic, and async support. The framework's performance benchmarks show it handles significantly more requests per second than Flask while providing better developer experience through type hints and automatic OpenAPI generation (Ramírez, 2023).

Pydantic models enforce strict input validation, ensuring only valid city codes, apartment sizes, and numerical ranges reach the prediction engine. This defensive approach prevents model errors from malformed input data.

### Frontend: React with Material-UI

The frontend utilizes React 18 with Material-UI (MUI) for component styling. MUI provides a consistent design language and pre-built accessible components, reducing development time while ensuring professional appearance. The component library follows Material Design principles, providing familiar interaction patterns for users.

### Data Visualization: Chart.js and react-simple-maps

Chart.js (via react-chartjs-2) renders the cost breakdown bar chart. The library offers responsive charts with minimal configuration and supports customization for tooltips, colors, and animations. For geographic visualization, react-simple-maps provides a lightweight React wrapper around D3-geo projections, enabling the interactive US affordability map without the complexity of raw D3 implementation (Cesal, 2022).

### Database: SQLite with Caching Layer

SQLite serves as the caching layer for API responses and query logging. This embedded database requires no server configuration, making it ideal for proof-of-concept development. The caching system stores city cost data with 24-hour expiration, reducing redundant calculations and demonstrating the pattern that would be used with real external APIs (Zillow, Numbeo) in production.

---

## Feature Lists

### PP4 Final Version Feature List

1. Real-time cost predictions for 10+ US cities
2. 8 lifestyle factor inputs (housing, dining, transportation, entertainment, groceries, fitness, healthcare, utilities)
3. Interactive affordability map with color-coded markers
4. Cost breakdown visualization with bar chart
5. Salary-based affordability calculations (30/40% thresholds)
6. Query history and analytics dashboard
7. City comparison feature (side-by-side analysis)
8. Export functionality (PDF reports)
9. User accounts with saved preferences
10. Integration with real-time data APIs (Zillow, Numbeo)

### R&D Feature List (Proof of Concept)

1. **UI Input Form:** All 8 lifestyle questions with appropriate controls (dropdowns, sliders, radio buttons)
2. **API Integration:** FastAPI backend with /predict endpoint accepting JSON payloads
3. **ML Prediction:** RandomForestRegressor model returning cost breakdown
4. **Data Display:** Results component showing total cost and category breakdown
5. **Visualization:** Bar chart rendering cost distribution
6. **Geographic Display:** US map with city markers and affordability coloring
7. **Caching:** SQLite database storing queries and caching responses
8. **Validation:** Pydantic models enforcing input constraints

---

## Development Process

### Triumphs

The integration between React and FastAPI proceeded smoothly after resolving CORS configuration. The modular component architecture allowed parallel development of the form, results display, chart, and map components. Chart.js integration required minimal configuration to achieve professional-quality visualizations.

The machine learning pipeline—from CSV data loading through model training to serialization with joblib—followed established patterns from scikit-learn documentation. Feature encoding with LabelEncoder and the separation of breakdown models (rent, food, transportation, utilities) from the main predictor provided granular cost estimates.

### Roadblocks

**CORS Configuration:** Initial API calls from React to FastAPI failed silently due to missing CORS middleware. Resolution required adding CORSMiddleware with explicit origin allowlisting for localhost:3000.

**Model Encoding Mismatch:** Early predictions returned incorrect values because the API encoded categorical features differently than the training script. Storing encoder mappings in model_metadata.json and loading them at API startup resolved this synchronization issue.

**Map Projection:** react-simple-maps uses [longitude, latitude] coordinate ordering, opposite of common convention. Several hours were spent debugging marker placement before discovering this documentation detail.

### Lessons Learned

1. **Save encoder state:** Machine learning models require exact feature encoding match between training and inference
2. **Test CORS early:** API integration issues surface only in browser environments, not unit tests
3. **Read library documentation thoroughly:** Assumptions about coordinate ordering caused significant debugging time
4. **Start with minimal viable features:** The R&D phase validated the technology stack without overbuilding

---

## Technology Evaluation

### Feasibility Assessment

The proof of concept demonstrates that the planned technology stack functions correctly. React communicates with FastAPI, the ML model returns predictions, and visualizations render as expected. The project is feasible for full development.

### Potential Obstacles

1. **Data Quality:** Current model R² of 0.44 indicates prediction accuracy limitations. Collecting more training data or obtaining real API data would improve performance.
2. **API Rate Limits:** Integration with Zillow/Numbeo APIs may encounter rate limiting; the caching layer mitigates this risk.
3. **Mobile Responsiveness:** Current UI is desktop-optimized; additional work needed for mobile layouts.

### Technology Boundaries

The RandomForestRegressor cannot extrapolate beyond training data ranges. Cities not in the training set require either similar city proxies or real-time API data. The SQLite database is suitable for single-user development but would require migration to PostgreSQL for production multi-user scenarios.

---

## Conclusion

The LiveCost R&D phase successfully validated the technology stack: React + Material-UI frontend, FastAPI + scikit-learn backend, Chart.js and react-simple-maps for visualization, and SQLite for caching. The proof of concept implements all planned R&D features and identifies clear paths for improvement in the PP4 development phase.

---

## References

Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5-32. https://doi.org/10.1023/A:1010933404324

Cesal, A. (2022). Getting started with react-simple-maps. *React Simple Maps Documentation*. https://www.react-simple-maps.io/docs/getting-started/

Ramírez, S. (2023). FastAPI documentation. https://fastapi.tiangolo.com/

scikit-learn developers. (2023). RandomForestRegressor documentation. https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html

### AI Assistance Documentation

Claude (Anthropic) was used for code documentation, debugging assistance, and document drafting. Prompts included requests for code commenting, CORS troubleshooting, and technical writing guidance.
