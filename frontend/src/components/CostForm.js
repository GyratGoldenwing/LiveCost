/**
 * CostForm Component
 *
 * The main input form with all 8 lifestyle questions plus city and salary.
 * Collects user preferences and passes them to App.js when submitted.
 *
 * Author: Jeremiah Williams
 * Course: Project & Portfolio IV - Full Sail University
 * Date: December 2025
 */

import React, { useState } from 'react';

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Tooltip,
} from '@mui/material';

import CalculateIcon from '@mui/icons-material/Calculate';


// Form options - keeping these as constants makes it easy to add more later
// or potentially fetch from the API

const CITIES = [
  { value: 'NYC', label: 'New York City' },
  { value: 'LA', label: 'Los Angeles' },
  { value: 'Chicago', label: 'Chicago' },
  { value: 'Austin', label: 'Austin' },
  { value: 'Miami', label: 'Miami' },
  { value: 'Seattle', label: 'Seattle' },
  { value: 'Boston', label: 'Boston' },
  { value: 'Denver', label: 'Denver' },
  { value: 'Dallas', label: 'Dallas' },
  { value: 'Phoenix', label: 'Phoenix' },
];

const APARTMENT_SIZES = [
  { value: 'studio', label: 'Studio' },
  { value: '1BR', label: '1 Bedroom' },
  { value: '2BR', label: '2 Bedroom' },
  { value: '3BR', label: '3+ Bedroom' },
];

const CAR_TYPES = [
  { value: 'compact', label: 'Compact' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'electric', label: 'Electric' },
];

const ENTERTAINMENT_LEVELS = [
  { value: 'low', label: 'Low ($50-100/mo)' },
  { value: 'moderate', label: 'Moderate ($100-250/mo)' },
  { value: 'high', label: 'High ($250+/mo)' },
];

const GROCERY_LEVELS = [
  { value: 'budget', label: 'Budget (Walmart, Aldi)' },
  { value: 'moderate', label: 'Moderate (Kroger, Publix)' },
  { value: 'premium', label: 'Premium (Whole Foods, Trader Joe\'s)' },
];

const FITNESS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'home', label: 'Home Workout' },
  { value: 'gym', label: 'Gym Membership' },
];

const HEALTHCARE_LEVELS = [
  { value: 'minimal', label: 'Minimal (Healthy, rarely visit doctor)' },
  { value: 'standard', label: 'Standard (Regular checkups)' },
  { value: 'comprehensive', label: 'Comprehensive (Frequent care needed)' },
];


function CostForm({ onSubmit, loading }) {
  // All the form data in one state object
  // Could use react-hook-form for a bigger app but this works fine
  const [formData, setFormData] = useState({
    city: 'Austin',
    apartmentSize: 'studio',
    diningFrequency: 3,
    carType: 'compact',
    commuteMiles: 10,
    entertainmentBudget: 'moderate',
    groceryHabits: 'moderate',
    fitnessRoutine: 'none',
    healthcareNeeds: 'standard',
    salary: 75000,
  });

  // Generic handler that works for any field
  // This pattern saves writing a separate handler for each input
  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Slider has a different onChange signature so needs its own handler
  const handleSliderChange = (field) => (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();  // Don't let the browser refresh the page
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* City selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="city-label">City</InputLabel>
        <Tooltip title="Select the city you want to calculate living costs for">
          <Select
            labelId="city-label"
            value={formData.city}
            label="City"
            onChange={handleChange('city')}
          >
            {CITIES.map((city) => (
              <MenuItem key={city.value} value={city.value}>
                {city.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </FormControl>

      {/* Q1: Apartment size */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="apartment-label">Apartment Size</InputLabel>
        <Tooltip title="Select your preferred apartment size">
          <Select
            labelId="apartment-label"
            value={formData.apartmentSize}
            label="Apartment Size"
            onChange={handleChange('apartmentSize')}
          >
            {APARTMENT_SIZES.map((size) => (
              <MenuItem key={size.value} value={size.value}>
                {size.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </FormControl>

      {/* Q2: Dining frequency - slider felt more natural for this */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Dining Out Frequency: {formData.diningFrequency}x per week
        </Typography>
        <Tooltip title="How often do you eat out or order food?">
          <Slider
            value={formData.diningFrequency}
            onChange={handleSliderChange('diningFrequency')}
            min={0}
            max={15}
            step={1}
            marks={[
              { value: 0, label: '0' },
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 15, label: '15' },
            ]}
            valueLabelDisplay="auto"
          />
        </Tooltip>
      </Box>

      {/* Q3: Vehicle type - radio buttons since there's only 4 options */}
      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <FormLabel component="legend">Vehicle Type</FormLabel>
        <RadioGroup
          row
          value={formData.carType}
          onChange={handleChange('carType')}
        >
          {CAR_TYPES.map((car) => (
            <FormControlLabel
              key={car.value}
              value={car.value}
              control={<Radio />}
              label={car.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Q4: Commute distance */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Daily Commute (miles)"
          type="number"
          value={formData.commuteMiles}
          onChange={handleChange('commuteMiles')}
          inputProps={{ min: 0, max: 100, step: 1 }}
          helperText="Round-trip daily commute distance"
        />
      </Box>

      {/* Q5: Entertainment */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="entertainment-label">Entertainment Budget</InputLabel>
        <Tooltip title="Monthly spending on entertainment, streaming, events, hobbies">
          <Select
            labelId="entertainment-label"
            value={formData.entertainmentBudget}
            label="Entertainment Budget"
            onChange={handleChange('entertainmentBudget')}
          >
            {ENTERTAINMENT_LEVELS.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </FormControl>

      {/* Q6: Grocery habits */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="grocery-label">Grocery Shopping</InputLabel>
        <Tooltip title="Where do you typically shop for groceries?">
          <Select
            labelId="grocery-label"
            value={formData.groceryHabits}
            label="Grocery Shopping"
            onChange={handleChange('groceryHabits')}
          >
            {GROCERY_LEVELS.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </FormControl>

      {/* Q7: Fitness */}
      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <FormLabel component="legend">Fitness Routine</FormLabel>
        <RadioGroup
          row
          value={formData.fitnessRoutine}
          onChange={handleChange('fitnessRoutine')}
        >
          {FITNESS_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Q8: Healthcare */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="healthcare-label">Healthcare Needs</InputLabel>
        <Tooltip title="How often do you need medical care or prescriptions?">
          <Select
            labelId="healthcare-label"
            value={formData.healthcareNeeds}
            label="Healthcare Needs"
            onChange={handleChange('healthcareNeeds')}
          >
            {HEALTHCARE_LEVELS.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </FormControl>

      {/* Salary - not one of the 8 questions but needed for the map */}
      <Box sx={{ mb: 3 }}>
        <Tooltip title="Enter your annual salary to calculate affordability ratios">
          <TextField
            fullWidth
            label="Annual Salary ($)"
            type="number"
            value={formData.salary}
            onChange={handleChange('salary')}
            inputProps={{ min: 0, step: 1000 }}
            helperText="Used to determine if cities are affordable for you"
          />
        </Tooltip>
      </Box>

      {/* Submit button */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        startIcon={<CalculateIcon />}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {loading ? 'Calculating...' : 'Calculate My Cost'}
      </Button>
    </Box>
  );
}

export default CostForm;
