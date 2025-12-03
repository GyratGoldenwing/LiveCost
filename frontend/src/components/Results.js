/**
 * Results Component
 *
 * Shows the prediction results from the backend - the total cost,
 * breakdown by category, and what the user entered.
 *
 * This is just a display component, no state or logic really.
 * Gets data from App.js and formats it nicely.
 *
 * Author: Jeremiah Williams
 * Course: Project & Portfolio IV - Full Sail University
 * Date: December 2025
 */

import React from 'react';

import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material';

import LocationCityIcon from '@mui/icons-material/LocationCity';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


// Format numbers as currency - Intl API is nicer than doing it manually
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


// Maps confidence level to MUI chip colors
// Green = good, Yellow = okay, Red = low confidence
const getConfidenceColor = (confidence) => {
  switch (confidence) {
    case 'High':
      return 'success';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'error';  // Our model is stuck here with only 70 data points
    default:
      return 'default';
  }
};


// Tooltip text explaining what the confidence means
// Users kept asking what "Low Confidence" meant so I added this
const getConfidenceTooltip = (confidence) => {
  switch (confidence) {
    case 'High':
      return 'Model R² > 0.90: Predictions are highly reliable based on strong correlation with training data.';
    case 'Medium':
      return 'Model R² between 0.75-0.90: Predictions are reasonably accurate but may vary from actual costs.';
    case 'Low':
      return 'Model R² < 0.75: Limited training data affects accuracy. Predictions are estimates—actual costs may vary. More data will improve confidence.';
    default:
      return 'Confidence level indicates prediction reliability based on model performance metrics.';
  }
};


// Nice labels for the breakdown categories
const CATEGORY_LABELS = {
  rent: 'Rent',
  food: 'Food & Dining',
  transportation: 'Transportation',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  groceries: 'Groceries',
  fitness: 'Fitness',
  healthcare: 'Healthcare',
};


function Results({ prediction }) {
  // Don't render if no data yet
  if (!prediction) return null;

  const { city, total_monthly_cost, breakdown, confidence, input_summary } =
    prediction;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Header with city and confidence badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationCityIcon color="primary" />
          <Typography variant="h6">{city}</Typography>
        </Box>

        {/* Confidence chip with tooltip explaining what it means */}
        <Tooltip
          title={getConfidenceTooltip(confidence)}
          arrow
          placement="bottom"
          sx={{ cursor: 'help' }}
        >
          <Chip
            icon={<CheckCircleIcon />}
            label={`${confidence} Confidence`}
            color={getConfidenceColor(confidence)}
            size="small"
            sx={{ cursor: 'help' }}
          />
        </Tooltip>
      </Box>

      {/* Big total cost display - the main thing users want to see */}
      <Box
        sx={{
          textAlign: 'center',
          py: 3,
          mb: 2,
          backgroundColor: 'primary.main',
          borderRadius: 2,
          color: 'white',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Estimated Monthly Cost
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {formatCurrency(total_monthly_cost)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          per month
        </Typography>
      </Box>

      {/* Breakdown table */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Cost Breakdown
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableBody>
            {Object.entries(breakdown).map(([category, amount]) => (
              <TableRow key={category}>
                <TableCell sx={{ border: 0, pl: 0 }}>
                  {CATEGORY_LABELS[category] || category}
                </TableCell>
                <TableCell align="right" sx={{ border: 0, pr: 0, fontWeight: 600 }}>
                  {formatCurrency(amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      {/* Show what the user entered - helps them verify their inputs */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Your Inputs
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.entries(input_summary).map(([key, value]) => (
          <Chip
            key={key}
            label={`${key.replace(/_/g, ' ')}: ${value}`}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>
    </Paper>
  );
}

export default Results;
