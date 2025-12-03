/**
 * CostChart Component
 *
 * Bar chart showing the cost breakdown using Chart.js.
 * Way easier than building a chart from scratch and looks good.
 *
 * Using react-chartjs-2 for the React wrapper - handles all the
 * lifecycle stuff so I don't have to worry about it.
 *
 * Author: Jeremiah Williams
 * Course: Project & Portfolio IV - Full Sail University
 * Date: December 2025
 */

import React from 'react';

// Chart.js needs you to register the pieces you use
// This is for tree-shaking (smaller bundle size)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { Box } from '@mui/material';


// Register Chart.js components - only do this once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// Short labels that fit under the bars
const CATEGORY_LABELS = {
  rent: 'Rent',
  food: 'Dining Out',
  transportation: 'Transport',  // Shortened so it fits
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  groceries: 'Groceries',
  fitness: 'Fitness',
  healthcare: 'Healthcare',
};


// Colors for each category - picked from Tailwind palette
// Each bar gets its own color so it's easy to tell them apart
const CATEGORY_COLORS = {
  rent: {
    background: 'rgba(37, 99, 235, 0.8)',    // Blue
    border: 'rgba(37, 99, 235, 1)',
  },
  food: {
    background: 'rgba(16, 185, 129, 0.8)',   // Green
    border: 'rgba(16, 185, 129, 1)',
  },
  transportation: {
    background: 'rgba(245, 158, 11, 0.8)',   // Orange
    border: 'rgba(245, 158, 11, 1)',
  },
  utilities: {
    background: 'rgba(139, 92, 246, 0.8)',   // Purple
    border: 'rgba(139, 92, 246, 1)',
  },
  entertainment: {
    background: 'rgba(236, 72, 153, 0.8)',   // Pink
    border: 'rgba(236, 72, 153, 1)',
  },
  groceries: {
    background: 'rgba(34, 197, 94, 0.8)',    // Emerald
    border: 'rgba(34, 197, 94, 1)',
  },
  fitness: {
    background: 'rgba(14, 165, 233, 0.8)',   // Sky blue
    border: 'rgba(14, 165, 233, 1)',
  },
  healthcare: {
    background: 'rgba(239, 68, 68, 0.8)',    // Red
    border: 'rgba(239, 68, 68, 1)',
  },
};


function CostChart({ breakdown }) {
  if (!breakdown) return null;

  // Pull out the data Chart.js needs
  const categories = Object.keys(breakdown);
  const values = Object.values(breakdown);
  const labels = categories.map((cat) => CATEGORY_LABELS[cat] || cat);
  const backgroundColors = categories.map(
    (cat) => CATEGORY_COLORS[cat]?.background || 'rgba(156, 163, 175, 0.8)'
  );
  const borderColors = categories.map(
    (cat) => CATEGORY_COLORS[cat]?.border || 'rgba(156, 163, 175, 1)'
  );

  // Chart.js data format
  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Cost ($)',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,  // Rounded corners look modern
        borderSkipped: false,
      },
    ],
  };

  // Chart options - spent a while tweaking these to look right
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,  // Don't need legend, bars are labeled
      },
      tooltip: {
        callbacks: {
          // Format tooltip as currency
          label: (context) => {
            const value = context.parsed.y;
            return `$${value.toLocaleString()}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,  // Cleaner without vertical grid lines
        },
        ticks: {
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',  // Super subtle grid
        },
        ticks: {
          font: { size: 12 },
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <Box sx={{ position: 'relative', height: 350 }}>
      <Bar data={data} options={options} />
    </Box>
  );
}

export default CostChart;
