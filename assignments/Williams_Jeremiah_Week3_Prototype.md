# LiveCost: Project Prototype Documentation

**Author:** Jeremiah Williams
**Course:** Project & Portfolio IV - Full Sail University
**Date:** December 2025

---

## Similar Products Research

### 1. Numbeo (numbeo.com)
**Strengths:**
- Comprehensive cost of living database for cities worldwide
- User-contributed data provides real-world accuracy
- Comparison tools for multiple cities

**Weaknesses:**
- No personalization based on lifestyle choices
- Interface is data-heavy and overwhelming
- No salary-based affordability analysis

**Features to Borrow:**
- City comparison capability
- Category-based cost breakdown structure

### 2. NerdWallet Cost of Living Calculator
**Strengths:**
- Clean, modern interface
- Salary adjustment recommendations
- Mobile-responsive design

**Weaknesses:**
- Limited lifestyle customization (only basic inputs)
- No visualization of cost breakdown
- Single city analysis only

**Features to Borrow:**
- Salary-based affordability messaging
- Clean form design patterns

### 3. PayScale Cost of Living Calculator
**Strengths:**
- Employer-focused salary data integration
- Geographic comparison features

**Weaknesses:**
- Focused on relocation rather than lifestyle planning
- No interactive map visualization
- Limited granularity in expense categories

**Features to Borrow:**
- Percentage-based affordability thresholds

---

## LiveCost Improvements Over Existing Products

1. **Lifestyle-Based Personalization:** 8 detailed questions capture individual spending patterns rather than using city averages
2. **Visual Affordability Map:** Interactive US map with color-coded markers shows at-a-glance affordability
3. **ML-Powered Predictions:** Machine learning model adapts predictions based on combined lifestyle factors
4. **Comprehensive Visualization:** Bar chart breakdown makes expense distribution immediately understandable
5. **Real-Time Calculation:** Instant feedback as users adjust preferences

---

## GUI Feature List

### Primary Features (Must Have)

| Feature | Description | Priority | Source |
|---------|-------------|----------|--------|
| City Selection Dropdown | Select from 10 major US cities | P1 | Original |
| Apartment Size Selector | Studio, 1BR, 2BR, 3BR+ options | P1 | Original |
| Dining Frequency Slider | 0-15 times per week | P1 | Original |
| Vehicle Type Radio Buttons | Compact, Sedan, SUV, Electric | P1 | Original |
| Commute Distance Input | Numeric input for daily miles | P1 | Original |
| Entertainment Budget Dropdown | Low, Moderate, High tiers | P1 | Original |
| Grocery Habits Dropdown | Budget, Moderate, Premium stores | P1 | Original |
| Fitness Routine Radio | None, Home, Gym options | P1 | Original |
| Healthcare Needs Dropdown | Minimal, Standard, Comprehensive | P1 | Original |
| Salary Input Field | Annual salary for affordability calc | P1 | NerdWallet |
| Calculate Button | Triggers prediction API call | P1 | Original |
| Total Cost Display | Large, prominent monthly estimate | P1 | Original |
| Cost Breakdown Table | 8-category itemized list | P1 | Numbeo |
| Bar Chart Visualization | Visual cost distribution | P1 | Original |
| Affordability Map | US map with city markers | P1 | Original |

### Secondary Features (Should Have)

| Feature | Description | Priority | Source |
|---------|-------------|----------|--------|
| Confidence Badge | Shows prediction reliability | P2 | Original |
| Input Summary Chips | Display entered preferences | P2 | Original |
| Map Legend | Color key for affordability | P2 | Original |
| Tooltip Explanations | Hover help for form fields | P2 | NerdWallet |
| Loading States | Spinner during API calls | P2 | Original |
| Error Messages | User-friendly error display | P2 | Original |

### Tertiary Features (Nice to Have - Future)

| Feature | Description | Priority | Source |
|---------|-------------|----------|--------|
| City Comparison | Side-by-side analysis | P3 | Numbeo |
| PDF Export | Download report | P3 | Original |
| Query History | Past calculations | P3 | Original |
| User Accounts | Save preferences | P3 | Original |
| Dark Mode | Theme toggle | P3 | Common |

---

## Prototype Implementation

### Current Prototype Capabilities

The functional prototype implements all Primary (P1) and Secondary (P2) features:

✅ Complete 8-question lifestyle form
✅ City and salary inputs
✅ Real-time ML predictions via API
✅ Total cost hero display with confidence badge
✅ Cost breakdown table with 8 categories
✅ Interactive bar chart visualization
✅ US affordability map with color-coded markers
✅ Responsive two-column layout
✅ Loading states and error handling
✅ Tooltips and helper text

### Prototype Link

**Figma Prototype:** [To be added - create interactive Figma mockup]

**Live Application:** http://localhost:3000 (when running locally)

**GitHub Repository:** https://github.com/GyratGoldenwing/LiveCost

---

## UX/UI Design Decisions

### Layout
- Two-column grid on desktop: Form (left) | Results (right)
- Single column on mobile with stacked sections
- Map spans full width below the main grid

### Color Palette
- Primary: #2563eb (Blue) - Actions, headers, branding
- Secondary: #10b981 (Green) - Money/success indicators
- Affordability: Green (#22c55e) < 30%, Yellow (#eab308) 30-40%, Red (#ef4444) > 40%

### Typography
- Font: Inter (clean, modern, highly legible)
- Hierarchy: h4 for title, h5 for section headers, body for content

### Interaction Patterns
- Immediate validation feedback
- Disabled submit button during loading
- Smooth transitions between empty/loading/results states
- Hover tooltips for additional context

---

## Platform Considerations

The application is built as a responsive web application targeting:
- **Primary:** Desktop browsers (Chrome, Firefox, Safari, Edge)
- **Secondary:** Tablet browsers
- **Tertiary:** Mobile browsers (simplified layout)

Material-UI's responsive breakpoints handle layout adaptation automatically.
