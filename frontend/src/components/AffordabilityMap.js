/**
 * AffordabilityMap Component
 *
 * Interactive US map showing city markers colored by affordability.
 * Using react-simple-maps - way easier than raw D3 for this use case.
 *
 * The idea is users can see at a glance if a city is affordable
 * based on the 30% rule (don't spend more than 30% of income on housing).
 *
 * Author: Jeremiah Williams
 * Course: Project & Portfolio IV - Full Sail University
 * Date: December 2025
 */

import React, { useState } from 'react';

// react-simple-maps handles all the D3-geo stuff under the hood
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

import { Box, Typography, Paper, Tooltip } from '@mui/material';


// TopoJSON for US states - loaded from CDN so we don't bloat our bundle
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';


// City coordinates - react-simple-maps uses [longitude, latitude]
// (opposite of how most people think about it)
const CITY_COORDINATES = {
  NYC: { coords: [-74.006, 40.7128], name: 'New York City' },
  LA: { coords: [-118.2437, 34.0522], name: 'Los Angeles' },
  Chicago: { coords: [-87.6298, 41.8781], name: 'Chicago' },
  Austin: { coords: [-97.7431, 30.2672], name: 'Austin' },
  Miami: { coords: [-80.1918, 25.7617], name: 'Miami' },
  Seattle: { coords: [-122.3321, 47.6062], name: 'Seattle' },
  Boston: { coords: [-71.0589, 42.3601], name: 'Boston' },
  Denver: { coords: [-104.9903, 39.7392], name: 'Denver' },
  Dallas: { coords: [-96.7970, 32.7767], name: 'Dallas' },
  Phoenix: { coords: [-112.0740, 33.4484], name: 'Phoenix' },
};


/**
 * Get marker color based on cost-to-income ratio.
 *
 * The thresholds are based on the standard financial advice:
 * - Under 30% = affordable (green)
 * - 30-40% = doable but tight (yellow)
 * - Over 40% = probably going to struggle (red)
 */
const getAffordabilityColor = (monthlyCost, annualSalary) => {
  if (!monthlyCost || !annualSalary || annualSalary <= 0) {
    return '#9ca3af';  // Gray when no data
  }

  const annualCost = monthlyCost * 12;
  const ratio = annualCost / annualSalary;

  if (ratio < 0.30) {
    return '#22c55e';  // Green - good to go
  } else if (ratio <= 0.40) {
    return '#eab308';  // Yellow - watch your spending
  } else {
    return '#ef4444';  // Red - might want to reconsider
  }
};


// Human-readable affordability text for tooltips
const getAffordabilityLabel = (monthlyCost, annualSalary) => {
  if (!monthlyCost || !annualSalary || annualSalary <= 0) {
    return 'No data';
  }

  const annualCost = monthlyCost * 12;
  const ratio = annualCost / annualSalary;
  const percentage = (ratio * 100).toFixed(1);

  if (ratio < 0.30) {
    return `Affordable (${percentage}% of income)`;
  } else if (ratio <= 0.40) {
    return `Moderate (${percentage}% of income)`;
  } else {
    return `Expensive (${percentage}% of income)`;
  }
};


function AffordabilityMap({ prediction, salary, selectedCity }) {
  const [hoveredCity, setHoveredCity] = useState(null);

  const monthlyCost = prediction?.total_monthly_cost || null;

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Affordability Map
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {prediction
          ? `Showing affordability for ${CITY_COORDINATES[selectedCity]?.name || selectedCity} based on $${salary?.toLocaleString() || 0}/year salary`
          : 'Calculate a cost estimate to see affordability'
        }
      </Typography>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
          <Typography variant="caption">Affordable (&lt;30%)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
          <Typography variant="caption">Moderate (30-40%)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
          <Typography variant="caption">Expensive (&gt;40%)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9ca3af' }} />
          <Typography variant="caption">No data</Typography>
        </Box>
      </Box>

      {/* The actual map */}
      <Box sx={{ width: '100%', height: 450 }}>
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: '100%' }}
        >
          {/* US states background */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e2e8f0"
                  stroke="#94a3b8"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#cbd5e1' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* City markers */}
          {Object.entries(CITY_COORDINATES).map(([cityCode, cityData]) => {
            const isSelected = cityCode === selectedCity;
            const markerColor = isSelected && prediction
              ? getAffordabilityColor(monthlyCost, salary)
              : '#9ca3af';

            const tooltipText = isSelected && prediction
              ? `${cityData.name}: $${monthlyCost?.toLocaleString()}/mo - ${getAffordabilityLabel(monthlyCost, salary)}`
              : `${cityData.name}: Select to calculate`;

            return (
              <Marker
                key={cityCode}
                coordinates={cityData.coords}
                onMouseEnter={() => setHoveredCity(cityCode)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                <Tooltip title={tooltipText} arrow placement="top">
                  <circle
                    r={isSelected ? 12 : 9}
                    fill={markerColor}
                    stroke={isSelected ? '#1e40af' : '#64748b'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>

                {/* City name on hover */}
                {hoveredCity === cityCode && (
                  <text
                    textAnchor="middle"
                    y={-12}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      fontWeight: 600,
                      fill: '#1e293b',
                    }}
                  >
                    {cityData.name}
                  </text>
                )}
              </Marker>
            );
          })}
        </ComposableMap>
      </Box>

      {/* Summary below map */}
      {prediction && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>{CITY_COORDINATES[selectedCity]?.name}:</strong>{' '}
            ${monthlyCost?.toLocaleString()}/month = ${(monthlyCost * 12)?.toLocaleString()}/year
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: getAffordabilityColor(monthlyCost, salary),
              fontWeight: 600
            }}
          >
            {getAffordabilityLabel(monthlyCost, salary)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default AffordabilityMap;
