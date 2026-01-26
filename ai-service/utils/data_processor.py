"""
Data Processor Utility
Handles sensor data analysis and interpretation
"""
import logging

logger = logging.getLogger(__name__)

class SensorDataProcessor:
    def __init__(self):
        # Optimal ranges for lettuce farming
        self.optimal_ranges = {
            'moisture': (40, 70),  # %
            'temperature': (15, 25),  # °C
            'humidity': (50, 70),  # %
            'pH': (6.0, 7.0),
            'nitrogen': (40, 100),  # mg/kg
            'phosphorus': (30, 80),  # mg/kg
            'potassium': (40, 120),  # mg/kg
        }
    
    def assess_soil_health(self, moisture=None, pH=None, nitrogen=None, phosphorus=None, potassium=None):
        """
        Assess overall soil health based on multiple parameters
        Returns: 'excellent', 'good', 'fair', 'poor'
        """
        scores = []
        
        if moisture is not None:
            if self.optimal_ranges['moisture'][0] <= moisture <= self.optimal_ranges['moisture'][1]:
                scores.append(100)
            elif moisture < self.optimal_ranges['moisture'][0]:
                scores.append(max(0, (moisture / self.optimal_ranges['moisture'][0]) * 100))
            else:
                scores.append(max(0, 100 - ((moisture - self.optimal_ranges['moisture'][1]) * 2)))
        
        if pH is not None:
            if self.optimal_ranges['pH'][0] <= pH <= self.optimal_ranges['pH'][1]:
                scores.append(100)
            else:
                deviation = min(abs(pH - self.optimal_ranges['pH'][0]), abs(pH - self.optimal_ranges['pH'][1]))
                scores.append(max(0, 100 - (deviation * 20)))
        
        if nitrogen is not None:
            if self.optimal_ranges['nitrogen'][0] <= nitrogen <= self.optimal_ranges['nitrogen'][1]:
                scores.append(100)
            else:
                scores.append(max(0, (nitrogen / self.optimal_ranges['nitrogen'][0]) * 100))
        
        if phosphorus is not None:
            if self.optimal_ranges['phosphorus'][0] <= phosphorus <= self.optimal_ranges['phosphorus'][1]:
                scores.append(100)
            else:
                scores.append(max(0, (phosphorus / self.optimal_ranges['phosphorus'][0]) * 100))
        
        if potassium is not None:
            if self.optimal_ranges['potassium'][0] <= potassium <= self.optimal_ranges['potassium'][1]:
                scores.append(100)
            else:
                scores.append(max(0, (potassium / self.optimal_ranges['potassium'][0]) * 100))
        
        if not scores:
            return 'unknown'
        
        avg_score = sum(scores) / len(scores)
        
        if avg_score >= 85:
            return 'excellent'
        elif avg_score >= 70:
            return 'good'
        elif avg_score >= 50:
            return 'fair'
        else:
            return 'poor'
    
    def calculate_stress_level(self, moisture=None, temperature=None, humidity=None):
        """
        Calculate plant stress level (0-100)
        Higher value = more stress
        """
        stress = 0
        count = 0
        
        if moisture is not None:
            if moisture < 20:
                stress += 80
            elif moisture < 30:
                stress += 50
            elif moisture < self.optimal_ranges['moisture'][0]:
                stress += 30
            count += 1
        
        if temperature is not None:
            if temperature < 10 or temperature > 30:
                stress += 70
            elif temperature < 15 or temperature > 25:
                stress += 40
            count += 1
        
        if humidity is not None:
            if humidity < 30 or humidity > 90:
                stress += 60
            elif humidity < 50 or humidity > 70:
                stress += 30
            count += 1
        
        return min(100, stress / max(1, count))
    
    def estimate_moisture_loss_rate(self, temperature=None, humidity=None, light_intensity=None):
        """
        Estimate moisture loss rate (%/hour)
        Based on environmental conditions
        """
        # Base rate
        rate = 0.5  # %/hour
        
        # Temperature factor
        if temperature is not None:
            if temperature > 25:
                rate += (temperature - 25) * 0.1
            elif temperature < 15:
                rate -= (15 - temperature) * 0.05
        
        # Humidity factor
        if humidity is not None:
            if humidity < 40:
                rate += (40 - humidity) * 0.02
            elif humidity > 70:
                rate -= (humidity - 70) * 0.01
        
        # Light intensity factor
        if light_intensity is not None:
            # Assuming light_intensity is in lux or percentage
            if light_intensity > 50:  # High light
                rate += 0.3
        
        return max(0, min(5, rate))  # Cap between 0-5%/hour
    
    def generate_recommendation(self, soil_health, stress_level, alerts):
        """
        Generate human-readable recommendation
        """
        if stress_level > 70:
            return "Immediate action required: Plant is under severe stress. Check moisture and temperature levels."
        elif stress_level > 50:
            return "Warning: Plant is experiencing moderate stress. Monitor conditions closely."
        elif soil_health == 'excellent':
            return "Soil conditions are optimal. Continue current maintenance routine."
        elif soil_health == 'good':
            return "Soil conditions are good. Minor adjustments may improve yield."
        elif soil_health == 'fair':
            return "Soil conditions need improvement. Consider adjusting irrigation or fertilization."
        else:
            return "Poor soil conditions detected. Multiple interventions recommended."
