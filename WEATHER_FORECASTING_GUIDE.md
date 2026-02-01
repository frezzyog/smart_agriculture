# 🌦️ Weather-Aware Smart Irrigation System

## Overview

The Smart Agriculture AI system now includes **weather forecasting** that enables the AI to make intelligent irrigation decisions based on predicted rainfall. This prevents water waste and optimizes resource usage by avoiding irrigation when natural rainfall is expected.

## Key Features

### 1. **Real-Time Weather Display**
- Current weather conditions (temperature, humidity, wind speed)
- 3-day weather forecast
- Visual rain probability indicators
- Beautiful, responsive weather card on dashboard

### 2. **AI Weather Integration**
The AI system automatically:
- ✅ Fetches weather forecast before making irrigation decisions
- ✅ Checks tomorrow's rain probability
- ✅ Skips irrigation if rain probability > 50%
- ✅ Delays fertilization if heavy rain (>70%) is expected
- ✅ Provides detailed alerts explaining the decision

### 3. **Smart Decision Logic**

#### Irrigation Decisions
```
IF soil_moisture < 45%:
    IF rain_probability_tomorrow > 50%:
        → SKIP irrigation (conserve water)
        → Display: "Rain Expected - Irrigation Postponed"
    ELSE:
        → TRIGGER irrigation normally
        
IF soil_moisture < 50%:
    IF rain_probability_tomorrow > 50%:
        → Display: "Irrigation Delayed - Rain Forecast"
    ELSE:
        → Show warning: "Low Soil Moisture"
```

#### Fertilization Decisions
```
IF EC < 1000 (nutrient deficiency):
    IF rain_probability_tomorrow > 70%:
        → SKIP fertilization (would wash away nutrients)
        → Display: "Fertilization Delayed - Heavy Rain Expected"
    ELSE:
        → TRIGGER fertilization normally
```

## Setup Instructions

### Step 1: Get OpenWeather API Key (FREE)

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click **"Sign Up"** and create a free account
3. Go to **API keys** section in your account
4. Copy your API key
5. **Free tier includes**: 1,000 API calls per day (more than enough!)

### Step 2: Configure Environment Variables

Update your `.env` file:

```bash
# Weather API Configuration
OPENWEATHER_API_KEY=your_actual_api_key_here
```

**Note**: If you don't set the API key, the system will automatically use demo weather data showing rain tomorrow (for testing purposes).

### Step 3: Restart Services

```bash
# Restart backend server
npm run dev

# Restart AI service (in ai-service folder)
start.bat
```

## How It Works

### Architecture Flow

```
┌─────────────────┐
│  Weather API    │
│ (OpenWeather)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Backend Server │────▶│  Weather Cache  │
│  (Node.js)      │     │  (30 min TTL)   │
└────────┬────────┘     └─────────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│   Dashboard     │   │   AI Service    │
│  (Weather Card) │   │  (Python)       │
└─────────────────┘   └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ Smart Decision  │
                      │ - Skip irrigation│
                      │ - Delay fertil.  │
                      └─────────────────┘
```

### API Endpoints

#### 1. Get Weather Data
```http
GET /api/weather?location=Phnom%20Penh,KH
```

**Response:**
```json
{
  "current": {
    "location": "Phnom Penh",
    "temperature": 28,
    "condition": "partly cloudy",
    "humidity": 75,
    "windSpeed": 12,
    "timestamp": "2026-02-01T16:28:09+07:00"
  },
  "forecast": [
    {
      "date": "2026-02-02",
      "tempMax": 32,
      "tempMin": 26,
      "condition": "rainy",
      "rainProbability": 75,
      "humidity": 85,
      "windSpeed": 15
    }
    // ... 2 more days
  ]
}
```

#### 2. Weather-Aware AI Interpretation
The existing `/api/ai/interpret` endpoint now automatically fetches and considers weather data.

## Dashboard UI

### Weather Card Features

1. **Current Weather Display**
   - Large temperature display
   - Weather condition with icon
   - Humidity and wind metrics

2. **Rain Alert Banner**
   - Appears when rain probability > 50%
   - Shows exact probability
   - Indicates AI will skip irrigation

3. **3-Day Forecast Cards**
   - Tomorrow, and next 2 days
   - Min/max temperatures
   - Rain probability badges
   - Dynamic weather icons

### Alert Examples

When the AI detects rain forecast:

```
🌧️ Rain Expected - Irrigation Postponed
Moisture at 42% but 75% chance of rain 
tomorrow. AI postponed irrigation to 
conserve water.
```

```
🌦️ Irrigation Delayed - Rain Forecast
Soil moisture is 48%. Irrigation delayed 
due to 65% rain probability tomorrow.
```

```
🌧️ Rain Forecast: 75%
Natural irrigation expected tomorrow. 
AI will optimize water usage accordingly.
```

## Benefits

### 💰 Cost Savings
- Reduces unnecessary water usage
- Prevents fertilizer waste
- Lowers electricity costs (pump operation)

### 🌱 Plant Health
- Avoids over-watering from rain + irrigation
- Prevents nutrient leaching from heavy rain
- Maintains optimal soil moisture

### 🌍 Environmental Impact
- Conserves water resources
- Reduces carbon footprint
- Sustainable agriculture practices

## Testing

### Test Case 1: Rain Expected, Low Moisture
```
Given:
  - Current moisture: 42%
  - Tomorrow rain: 75%
  
Expected:
  - AI skips irrigation
  - Alert: "Rain Expected - Irrigation Postponed"
  - recommendAction: false
```

### Test Case 2: No Rain, Low Moisture
```
Given:
  - Current moisture: 42%
  - Tomorrow rain: 10%
  
Expected:
  - AI triggers irrigation
  - Alert: "Critical Soil Moisture"
  - recommendAction: true
  - Action: Turn ON water pump for 420s
```

### Test Case 3: Heavy Rain, Low Nutrients
```
Given:
  - EC: 900 µS/cm (low nutrients)
  - Tomorrow rain: 80%
  
Expected:
  - AI skips fertilization
  - Alert: "Fertilization Delayed - Heavy Rain Expected"
  - Reason: Rain would wash away nutrients
```

## Customization

### Change Location
Update the default location in `server.js`:

```javascript
const location = req.query.location || 'YOUR_CITY,COUNTRY_CODE'
```

Or pass as query parameter:
```
http://localhost:5000/api/weather?location=Siem%20Reap,KH
```

### Adjust Rain Threshold
Modify `ai-service/app.py`:

```python
# Current: Skip if rain > 50%
skip_irrigation_due_to_rain = tomorrow_rain_probability > 50

# More conservative: Skip if rain > 30%
skip_irrigation_due_to_rain = tomorrow_rain_probability > 30

# More aggressive: Skip if rain > 70%
skip_irrigation_due_to_rain = tomorrow_rain_probability > 70
```

### Customize Cache Duration
In `server.js`:

```javascript
// Current: 30 minutes
const WEATHER_CACHE_DURATION = 30 * 60 * 1000

// Change to 1 hour
const WEATHER_CACHE_DURATION = 60 * 60 * 1000
```

## Troubleshooting

### Weather Card Shows "Weather data unavailable"
**Solution**: 
- Check if backend server is running
- Verify OPENWEATHER_API_KEY in .env
- Check browser console for errors

### AI Not Considering Weather
**Solution**:
- Check AI service logs for "🌦️ Weather Check" message
- Verify BACKEND_URL in ai-service/.env
- Ensure backend /api/weather endpoint works: `http://localhost:5000/api/weather`

### Demo Data Showing Instead of Real Weather
**Cause**: Invalid or missing API key
**Solution**: 
1. Verify your API key at openweathermap.org
2. Copy-paste exactly (no extra spaces)
3. Wait 10-15 minutes for new API keys to activate
4. Restart backend server

## Future Enhancements

### Potential Features
- [ ] 7-day forecast integration
- [ ] Precipitation amount tracking
- [ ] Weather-based fertilization scheduling
- [ ] Historical weather data analysis
- [ ] Extreme weather alerts (storms, frost)
- [ ] Integration with local weather stations
- [ ] Soil evapotranspiration calculations

## Technical Details

### Files Modified
1. `client/components/dashboard/WeatherCard.js` - New weather UI component
2. `client/app/dashboard/page.js` - Added weather card to dashboard
3. `server.js` - Added `/api/weather` endpoint with caching
4. `ai-service/app.py` - Enhanced AI with weather-aware decisions
5. `.env` - Added OPENWEATHER_API_KEY configuration

### Dependencies
All required dependencies are already included:
- `node-fetch` (Node.js)
- `httpx` (Python)
- No new installations needed!

## Support

For issues or questions:
1. Check the server logs for weather API errors
2. Verify your API key is valid and active
3. Test the endpoint directly: `curl http://localhost:5000/api/weather`

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Author**: Smart Agriculture AI Team
