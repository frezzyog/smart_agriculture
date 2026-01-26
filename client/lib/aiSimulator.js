// Generate fake 7-day AI soil moisture prediction
console.log("SIMULATOR FILE LOADED")

export const simulateAIPredictions = (zoneId) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let moisture = 65 + Math.random() * 10;

    return days.map((day, index) => {
        const weatherImpact = Math.random() < 0.4 ? -5 : 1.5;
        const randomNoise = (Math.random() * 4) - 2;

        moisture = Math.max(25, Math.min(95, moisture + weatherImpact + randomNoise));

        return {
            id: `${zoneId}-${index}`,
            zone_id: zoneId,
            day,
            predicted_moisture: Number(moisture.toFixed(1)),
            confidence: Number((0.85 + Math.random() * 0.12).toFixed(2)),
            created_at: new Date().toISOString()
        };
    });
};

// Generate fake AI alerts based on prediction
export const simulateAlerts = () => {
    const alerts = [
        { id: 101, type: "Irrigation Needed", severity: "high", message: "Main Field moisture levels are dropping rapidly.", timestamp: new Date().toISOString(), read: false },
        { id: 102, type: "Heat Stress Risk", severity: "medium", message: "High temperature predicted for tomorrow.", timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
        { id: 103, type: "Nutrient Imbalance", severity: "low", message: "Nitrogen levels slightly below optimal in main sector.", timestamp: new Date(Date.now() - 7200000).toISOString(), read: false }
    ];

    // Return alerts that apply to our single zone
    return alerts.filter(() => Math.random() > 0.3);
};

export const simulateZones = () => [
    { id: 'main-zone', name: 'Main Agricultural Field', status: 'optimal', moisture: 68 }
];
