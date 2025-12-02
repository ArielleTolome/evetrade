# Long-Term Trading Predictions

## Overview

The Long-Term Trading Predictions page (`/predictions`) helps EVE Online traders identify items that are likely to appreciate in value over the next 1-3 months. This feature uses a simulated prediction algorithm to forecast price trends based on multiple market factors.

## Features

### 1. Market Prediction Algorithm

The prediction engine analyzes several key factors:

- **Volume Trends**: Tracks demand patterns (rising/stable/falling)
- **Price Momentum**: Identifies upward or downward price movements
- **Seasonality**: Factors in EVE events and updates that affect demand
- **Volatility**: Assesses price stability and risk

### 2. Prediction Metrics

Each prediction includes:

- **Current Price**: Today's market price
- **Predicted Price**: Forecasted price after selected time horizon
- **ROI %**: Expected return on investment
- **Profit per Unit**: Expected profit margin
- **Volume Trend**: Market demand direction (↑ rising, → stable, ↓ falling)
- **Risk Level**: Low/Medium/High based on volatility
- **Confidence Score**: 0-100% prediction reliability

### 3. Filter Controls

Refine predictions with:

- **Time Horizon**: 1/2/3 months
- **Risk Level**: Filter by risk tolerance
- **Volume Trend**: Show only items with specific demand patterns
- **Minimum ROI**: Set profit threshold (0-50%)
- **Minimum Investment**: Filter by price per unit

### 4. Investment Calculator

A built-in calculator that:

- Shows the top predicted opportunity
- Calculates quantity based on investment amount
- Projects total returns and profit
- Displays risk level and confidence score

### 5. Copy-Paste Features

Quick data export options:

- **Copy Item Name**: Single-click to copy item names
- **Copy Prediction**: Full prediction details for individual items
- **Copy All**: Export entire table as tab-delimited text
- **Copy Names**: Bulk copy item names for multibuy

### 6. Top Picks Display

Visual cards showing the top 3 predictions with:

- Rank badges (1st/2nd/3rd)
- Item category
- ROI percentage
- Current vs predicted prices
- Risk and confidence metrics

## Usage Guide

### Finding High-ROI Opportunities

1. Navigate to `/predictions`
2. Set your **Time Horizon** (1-3 months)
3. Adjust **Minimum ROI** to filter low-return items
4. Filter by **Risk Level** based on your tolerance
5. Review the top predictions in the card view
6. Click any prediction for more details

### Using the Investment Calculator

1. Scroll to the Investment Calculator section
2. Adjust the **Investment Amount** slider
3. Review calculated metrics:
   - Quantity you can purchase
   - Total investment cost
   - Predicted future value
   - Expected profit

### Exporting Data

**Single Item:**
- Click the copy icon in the Actions column
- Paste into spreadsheet or notes

**All Predictions:**
- Click "Copy All" button
- Open Excel/Google Sheets
- Paste to create instant table

**Item Names Only:**
- Click "Copy Names" button
- Paste into EVE Online multibuy

## Prediction Algorithm Details

The algorithm simulates realistic market behavior:

### Volume Trend Calculation
- **Rising**: Increasing demand, positive momentum
- **Stable**: Consistent demand, neutral momentum
- **Falling**: Decreasing demand, negative momentum

### Risk Assessment
Based on:
- Historical volatility (item category specific)
- Volume trend direction
- Magnitude of predicted ROI
- Market liquidity

### Confidence Scoring
Factors include:
- Volume trend strength (higher = more confident)
- Volatility (lower = more confident)
- Item category (skillbooks = more predictable)
- Historical data quality

## Categories Analyzed

The system analyzes items from these categories:

- **Frigates**: T1/T2/Faction frigates
- **Cruisers**: Combat and support cruisers
- **Drones**: Combat and utility drones
- **Skillbooks**: Training skill books
- **Materials**: Manufacturing and PI materials
- **Modules**: Ship fitting modules

## Best Practices

### For Conservative Traders
1. Filter to **Low Risk** only
2. Set **Minimum Confidence** to 70%+
3. Focus on **Stable** volume trends
4. Choose 3-month horizon for stability

### For Aggressive Traders
1. Include **High Risk** predictions
2. Look for **Rising** volume trends
3. Target high ROI (30%+)
4. Use 1-month horizon for quick returns

### Risk Management
1. Never invest more than you can afford to lose
2. Diversify across multiple predictions
3. Monitor market conditions regularly
4. Set stop-loss thresholds

## Disclaimer

**IMPORTANT**: These predictions are generated using simulated data and algorithmic analysis. They do not guarantee future results and should not be considered financial advice. EVE Online markets are highly volatile and influenced by:

- Player wars and conflicts
- Game updates and patches
- Alliance politics
- Market manipulation
- External community events

Always conduct your own research and trade responsibly.

## Technical Details

### Data Sources
- Static item database (invTypes)
- Simulated market trends
- Category-based volatility models

### Update Frequency
Predictions regenerate when:
- Time horizon changes
- Filters are adjusted
- Page is refreshed

### Performance
- Analyzes ~150 items per load
- Instant filter updates
- Optimized React rendering

## Future Enhancements

Potential improvements:
- Real market data integration via ESI
- Historical price tracking
- Machine learning predictions
- Custom watchlists
- Price alerts for predictions
- Export to portfolio tracker

## Feedback

Found an issue or have suggestions? Please report on the EVETrade GitHub repository.
