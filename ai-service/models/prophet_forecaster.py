"""
Prophet-based Time Series Forecaster for Irrigation Predictions
Uses Facebook Prophet for accurate multi-day moisture forecasting
"""
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

# Pandas/Numpy import with fallback
try:
    import pandas as pd
    import numpy as np
    LIBS_AVAILABLE = True
except ImportError:
    LIBS_AVAILABLE = False
    print("⚠️ Pandas/Numpy not installed. Using pure Python fallback.")

# Prophet import with fallback
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("⚠️ Prophet not installed. Using rule-based fallback.")


class ProphetForecaster:
    """
    Time-series forecaster using Facebook Prophet
    Predicts soil moisture levels based on historical sensor data
    """
    
    def __init__(self):
        self.model = None
        self.is_trained = False
        
    def prepare_training_data(self, sensor_history: List[Dict[str, Any]]):
        """
        Convert sensor history to Prophet-compatible format
        Prophet requires 'ds' (datestamp) and 'y' (value) columns
        """
        if not sensor_history or not LIBS_AVAILABLE:
            return None
        
        df = pd.DataFrame(sensor_history)
        
        # Ensure we have timestamp and moisture columns
        if 'timestamp' not in df.columns or 'moisture' not in df.columns:
            return pd.DataFrame(columns=['ds', 'y'])
        
        # Rename columns for Prophet
        df = df.rename(columns={'timestamp': 'ds', 'moisture': 'y'})
        df['ds'] = pd.to_datetime(df['ds'])
        
        return df[['ds', 'y']]
    
    def train(self, sensor_history: List[Dict[str, Any]]) -> bool:
        """
        Train Prophet model on historical sensor data
        Returns True if training successful
        """
        if not PROPHET_AVAILABLE:
            print("Prophet not available, using fallback predictions")
            return False
        
        df = self.prepare_training_data(sensor_history)
        
        if len(df) < 10:  # Need minimum data points
            print(f"Insufficient data for training: {len(df)} points")
            return False
        
        try:
            self.model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=True,
                changepoint_prior_scale=0.05
            )
            self.model.fit(df)
            self.is_trained = True
            print(f"✅ Prophet model trained on {len(df)} data points")
            return True
        except Exception as e:
            print(f"❌ Prophet training failed: {e}")
            return False
    
    def predict(self, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """
        Generate predictions for the next N days
        """
        if PROPHET_AVAILABLE and LIBS_AVAILABLE and self.is_trained and self.model:
            return self._prophet_predict(days_ahead)
        else:
            return self._fallback_predict(days_ahead)
    
    def _prophet_predict(self, days_ahead: int) -> List[Dict[str, Any]]:
        """Use trained Prophet model for predictions"""
        future = self.model.make_future_dataframe(periods=days_ahead * 24, freq='H')
        forecast = self.model.predict(future)
        
        # Get only future predictions
        now = datetime.now()
        future_forecast = forecast[forecast['ds'] > now]
        
        predictions = []
        for _, row in future_forecast.iterrows():
            predictions.append({
                "timestamp": row['ds'].isoformat(),
                "predicted_moisture": max(0, min(100, row['yhat'])),
                "lower_bound": max(0, row['yhat_lower']),
                "upper_bound": min(100, row['yhat_upper']),
                "confidence": 0.85
            })
        
        return predictions
    
    def _fallback_predict(self, days_ahead: int) -> List[Dict[str, Any]]:
        """Rule-based fallback when Prophet unavailable"""
        predictions = []
        base_moisture = 65.0  # Assumed starting moisture
        
        for day in range(days_ahead):
            # Simple decay model
            decay_rate = 0.08 + (random.random() * 0.04)
            predicted = base_moisture * (1 - decay_rate) ** day
            
            predictions.append({
                "timestamp": (datetime.now() + timedelta(days=day)).isoformat(),
                "predicted_moisture": round(max(10, predicted), 1),
                "lower_bound": round(max(5, predicted - 10), 1),
                "upper_bound": round(min(100, predicted + 10), 1),
                "confidence": 0.7
            })
        
        return predictions


class WeatherAwareMoisturePredictor:
    """
    Advanced moisture predictor that incorporates weather forecasts
    """
    
    def __init__(self, weather_service=None):
        self.prophet_forecaster = ProphetForecaster()
        self.weather_service = weather_service
        
    async def predict_with_weather(
        self, 
        sensor_history: List[Dict[str, Any]],
        lat: float,
        lon: float,
        days_ahead: int = 7
    ) -> Dict[str, Any]:
        """
        Generate moisture predictions enhanced with weather data
        """
        # Get base predictions
        self.prophet_forecaster.train(sensor_history)
        base_predictions = self.prophet_forecaster.predict(days_ahead)
        
        # Get weather forecast if available
        weather_data = None
        if self.weather_service:
            weather_data = await self.weather_service.get_forecast(lat, lon, days_ahead)
        
        # Adjust predictions based on weather
        adjusted_predictions = self._adjust_for_weather(base_predictions, weather_data)
        
        return {
            "predictions": adjusted_predictions,
            "weather_data": weather_data,
            "model_type": "prophet" if self.prophet_forecaster.is_trained else "rule_based"
        }
    
    def _adjust_for_weather(
        self, 
        predictions: List[Dict], 
        weather: Optional[Dict]
    ) -> List[Dict]:
        """
        Adjust moisture predictions based on weather forecast
        Rain increases predicted moisture, heat decreases it
        """
        if not weather or 'forecast' not in weather:
            return predictions
        
        weather_forecast = weather['forecast']
        
        for i, pred in enumerate(predictions):
            if i < len(weather_forecast):
                wx = weather_forecast[i]
                
                # Rain adjustment: +15% moisture if raining
                if wx.get('is_raining', False):
                    pred['predicted_moisture'] = min(100, pred['predicted_moisture'] + 15)
                    pred['rain_boost'] = True
                
                # Heat adjustment: -5% per degree above 30°C
                temp_max = wx.get('temp_max', 28)
                if temp_max > 30:
                    heat_penalty = (temp_max - 30) * 5
                    pred['predicted_moisture'] = max(10, pred['predicted_moisture'] - heat_penalty)
                    pred['heat_stress'] = True
        
        return predictions
