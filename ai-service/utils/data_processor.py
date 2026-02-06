"""
Data Processor Utility
Handles sensor data analysis and interpretation
"""
import logging

logger = logging.getLogger(__name__)

class SensorDataProcessor:
    def __init__(self):
        # Updated optimal ranges based on MAFF / FAO / CARDI standards (Lettuce farming)
        self.optimal_ranges = {
            'moisture': (60, 80),      # % (Lettuce standard)
            'temperature': (18, 24),   # °C (MAFF standard)
            'humidity': (60, 80),      # %
            'pH': (6.0, 6.8),          # (Optimal for nutrient lock-up prevention)
            'ec': (1200, 1600),        # µS/cm (1.2 - 1.6 mS/cm)
            'nitrogen': (30, 50),      # mg/kg
            'phosphorus': (15, 30),    # mg/kg
            'potassium': (80, 120),    # mg/kg
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
                # Score decreases linearly as it drops below 60%
                scores.append(max(0, (moisture / self.optimal_ranges['moisture'][0]) * 100))
            else:
                scores.append(max(0, 100 - ((moisture - self.optimal_ranges['moisture'][1]) * 2)))
        
        if pH is not None:
            if self.optimal_ranges['pH'][0] <= pH <= self.optimal_ranges['pH'][1]:
                scores.append(100)
            else:
                deviation = min(abs(pH - self.optimal_ranges['pH'][0]), abs(pH - self.optimal_ranges['pH'][1]))
                scores.append(max(0, 100 - (deviation * 30))) # Faster drop for pH sensitive lettuce
        
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
                # Capped at 100 to avoid one nutrient masking others but allow dropping for low values
                score = (potassium / self.optimal_ranges['potassium'][0]) * 100
                scores.append(min(100, max(0, score)))
        
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
        Calculate plant stress level (0-100) using new thresholds
        Higher value = more stress
        """
        stress = 0
        count = 0
        
        if moisture is not None:
            if moisture < 40:
                stress += 90  # Severe Danger
            elif moisture < 50:
                stress += 60  # Warning Level
            elif moisture < self.optimal_ranges['moisture'][0]:
                stress += 30  # Mild Stress
            count += 1
        
        if temperature is not None:
            if temperature > 33:
                stress += 90  # Critical - Lettuce roots stop absorbing nutrients
            elif temperature > 27:
                stress += 60  # Alert - Heat danger
            elif temperature < 15 or temperature > 25:
                # Slightly outside 18-24 range
                stress += 25
            count += 1
        
        if humidity is not None:
            if humidity > 85:
                stress += 70  # Tipburn danger
            elif humidity < 40 or humidity > 75:
                stress += 20
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
            return "ត្រូវការសកម្មភាពជាបន្ទាន់៖ រុក្ខជាតិកំពុងស្ថិតក្នុងភាពតានតឹងខ្លាំង។ សូមពិនិត្យកម្រិតសំណើម និងសីតុណ្ហភាព។"
        elif stress_level > 50:
            return "ការព្រមាន៖ រុក្ខជាតិកំពុងជួបប្រទះភាពតានតឹងមធ្យម។ សូមតាមដានលក្ខខណ្ឌដោយយកចិត្តទុកដាក់។"
        elif soil_health == 'excellent':
            return "លក្ខខណ្ឌដីគឺល្អបំផុត។ បន្តការថែទាំបច្ចុប្បន្នរបស់អ្នក។"
        elif soil_health == 'good':
            return "លក្ខខណ្ឌដីគឺល្អ។ ការកែតម្រូវបន្តិចបន្តួចអាចជួយបង្កើនទិន្នផល។"
        elif soil_health == 'fair':
            return "លក្ខខណ្ឌដីត្រូវការការកែលម្អ។ ពិចារណាកែតម្រូវការស្រោចស្រព ឬការដាក់ជី។"
        else:
            return "រកឃើញលក្ខខណ្ឌដីមិនល្អ។ ណែនាំឱ្យមានការអន្តរាគមន៍ច្រើនយ៉ាង។"
