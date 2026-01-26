"""
Zone Optimizer
Optimizes water and fertilizer distribution across multiple zones
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ZoneOptimizer:
    def __init__(self):
        pass
    
    def optimize_allocation(self, zones: List[Dict[str, Any]]):
        """
        Optimize resource allocation across zones
        
        Args:
            zones: List of zone data with:
                - zoneId
                - currentMoisture
                - targetMoisture
                - area
                - cropPriority (1-10)
                - dryingRate
        
        Returns:
            Optimized allocation plan for each zone
        """
        total_water_available = 1000  # Liters (this should come from system config)
        
        # Calculate priority scores for each zone
        priorities = []
        for zone in zones:
            zone_id = zone.get('zoneId')
            current_moisture = zone.get('currentMoisture', 50)
            target_moisture = zone.get('targetMoisture', 60)
            area = zone.get('area', 100)  # m²
            crop_priority = zone.get('cropPriority', 5)
            drying_rate = zone.get('dryingRate', 1.0)
            
            # Calculate moisture deficit
            deficit = max(0, target_moisture - current_moisture)
            
            # Calculate urgency based on deficit and drying rate
            urgency = deficit * drying_rate
            
            # Combined priority score
            priority_score = urgency * crop_priority
            
            # Calculate water needed
            # Simplified: 1L per m² raises moisture by 1%
            water_needed = deficit * area
            
            priorities.append({
                'zoneId': zone_id,
                'priorityScore': priority_score,
                'waterNeeded': water_needed,
                'deficit': deficit,
                'area': area
            })
        
        # Sort by priority (highest first)
        priorities.sort(key=lambda x: x['priorityScore'], reverse=True)
        
        # Allocate water
        allocation = {}
        remaining_water = total_water_available
        
        for zone_data in priorities:
            zone_id = zone_data['zoneId']
            water_needed = zone_data['waterNeeded']
            
            # Allocate water (proportional to need, limited by availability)
            allocated = min(water_needed, remaining_water)
            
            # Calculate irrigation duration
            # Assuming irrigation rate of 5L/min
            irrigation_rate = 5  # L/min
            duration = int((allocated / irrigation_rate) * 60)  # seconds
            
            allocation[zone_id] = {
                'waterAllocated': round(allocated, 2),
                'duration': duration,
                'priorityScore': round(zone_data['priorityScore'], 2),
                'rationale': self._get_rationale(zone_data['deficit'], zone_data['priorityScore'])
            }
            
            remaining_water -= allocated
            
            if remaining_water <= 0:
                break
        
        # Zones that didn't get water
        for zone_data in priorities:
            if zone_data['zoneId'] not in allocation:
                allocation[zone_data['zoneId']] = {
                    'waterAllocated': 0,
                    'duration': 0,
                    'priorityScore': round(zone_data['priorityScore'], 2),
                    'rationale': 'Insufficient water available - low priority'
                }
        
        return {
            'allocation': allocation,
            'totalWaterUsed': round(total_water_available - remaining_water, 2),
            'efficiency': round(((total_water_available - remaining_water) / total_water_available) * 100, 1)
        }
    
    def _get_rationale(self, deficit, priority_score):
        """Generate human-readable rationale for allocation decision"""
        if deficit > 20:
            return f"High moisture deficit ({deficit}%) - urgent irrigation needed"
        elif deficit > 10:
            return f"Moderate moisture deficit ({deficit}%) - irrigation recommended"
        elif priority_score > 50:
            return "High priority crop - proactive irrigation"
        else:
            return "Maintenance irrigation"
