/**
 * LiveCost - Main Application Component
 *
 * This is the main React component that pulls everything together.
 * It handles the state (loading, errors, prediction data) and passes
 * it down to the child components.
 *
 * Component structure:
 * - CostForm: The input form with all 8 lifestyle questions
 * - Results: Shows the prediction and cost breakdown table
 * - CostChart: Bar chart visualization
 * - AffordabilityMap: US map with city markers
 *
 * Author: Jeremiah Williams
 * Course: Project & Portfolio IV - Full Sail University
 * Date: December 2025
 */

import React, { useState } from 'react';

// Material-UI components - using this because it looks professional
// and saves a ton of time vs building everything from scratch
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';

// My custom components
import CostForm from './components/CostForm';
import Results from './components/Results';
import CostChart from './components/CostChart';
import AffordabilityMap from './components/AffordabilityMap';

// API service for talking to the backend
import { predictCost } from './services/api';


// Custom theme - colors picked from Tailwind's palette because they look good
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',  // Blue
    },
    secondary: {
      main: '#10b981',  // Green for money-related stuff
    },
    background: {
      default: '#f1f5f9',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});


function App() {
  // State for tracking loading/error/data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // These are for the affordability map
  const [selectedCity, setSelectedCity] = useState('Austin');
  const [salary, setSalary] = useState(75000);

  // Handle form submission - calls the backend API
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    // Update map state
    setSelectedCity(formData.city);
    setSalary(parseFloat(formData.salary) || 75000);

    try {
      const result = await predictCost(formData);
      setPrediction(result);
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Please try again.');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              LiveCost
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Real-Time Cost of Living Intelligence
            </Typography>
          </Box>

          {/* Main content - two column layout on desktop */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}
          >
            {/* Left column - the form */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Your Lifestyle Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tell us about your lifestyle preferences to get a personalized
                cost estimate.
              </Typography>

              <CostForm onSubmit={handleSubmit} loading={loading} />
            </Paper>

            {/* Right column - results/loading/empty state */}
            <Box>
              {/* Show spinner while loading */}
              {loading && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 300,
                  }}
                >
                  <CircularProgress size={48} />
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    Calculating your personalized cost...
                  </Typography>
                </Paper>
              )}

              {/* Show error if something went wrong */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Show results when we have data */}
              {prediction && !loading && (
                <>
                  <Results prediction={prediction} />

                  <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Cost Breakdown
                    </Typography>
                    <CostChart breakdown={prediction.breakdown} />
                  </Paper>
                </>
              )}

              {/* Empty state - before user submits */}
              {!prediction && !loading && !error && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 300,
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Select Your Preferences
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: 'center' }}
                  >
                    Fill out the form and click "Calculate My Cost" to see your
                    personalized cost of living estimate.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>

          {/* Affordability map - full width below the grid */}
          <Box sx={{ mt: 3 }}>
            <AffordabilityMap
              prediction={prediction}
              salary={salary}
              selectedCity={selectedCity}
            />
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4, pt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              LiveCost R&D Proof of Concept | Project & Portfolio IV | Jeremiah
              Williams
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
