import httpx
from typing import Dict, Any, Optional
import os
from datetime import datetime

class WeatherService:
    """
    Service to fetch real-world weather data for specific locations
    Uses Open-Meteo for free, key-less weather data
    """
    
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        
    async def get_forecast(self, lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
        """
        Fetch weather forecast for a specific coordinate
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,snowfall_sum",
            "timezone": "auto",
            "forecast_days": days
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                return self._process_forecast_data(data)
            except Exception as e:
                print(f"Error fetching weather: {e}")
                # Return dummy/fallback data if API fails
                return self._get_fallback_forecast(days)

    def _process_forecast_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process Raw Open-Meteo data into a simpler format"""
        daily = data.get('daily', {})
        forecast = []
        
        for i in range(len(daily.get('time', []))):
            forecast.append({
                "date": daily['time'][i],
                "temp_max": daily['temperature_2m_max'][i],
                "temp_min": daily['temperature_2m_min'][i],
                "precipitation": daily['precipitation_sum'][i],
                "is_raining": daily['rain_sum'][i] > 0.5
            })
            
        return {
            "source": "Open-Meteo",
            "forecast": forecast
        }

    def _get_fallback_forecast(self, days: int) -> Dict[str, Any]:
        """Fallback forecast data in case of API error"""
        return {
            "source": "Fallback",
            "forecast": [
                {
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "temp_max": 30.0,
                    "temp_min": 24.0,
                    "precipitation": 0.0,
                    "is_raining": False
                } for _ in range(days)
            ]
        }
