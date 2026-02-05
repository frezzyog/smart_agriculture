// Simulate realistic sensor data with some issues to test AI advice (HTTP Mode)
const axios = require('axios');

const DEVICE_ID = "SMARTAG-001"; // Matched from smartag_device.ino
const SERVER_URL = "http://localhost:5000/api/sensors/data";

async function simulateData() {
    const data = {
        deviceId: DEVICE_ID,

        // 🔴 PROBLEM: Very Dry Soil (Trigger for AI)
        moisture: 35.0,

        // 🔥 PROBLEM: Hot Temperature (Trigger for AI)
        temp: 29.5,

        // ✅ GOOD: pH is optimal
        pH: 6.5,

        // Nutrient data
        nitrogen: 160,
        phosphorus: 40,
        potassium: 200,
        ec: 1400,

        humidity: 60,

        // Rain status
        isRaining: false
    };

    try {
        await axios.post(SERVER_URL, data);
        console.log(`✅ [${new Date().toLocaleTimeString()}] Sent Data for ${DEVICE_ID}: Moisture=${data.moisture}% Temp=${data.temp}°C`);
    } catch (error) {
        console.error('❌ Error sending data:', error.message);
        if (error.response) {
            console.error('Backend Response:', error.response.data);
        }
    }
}

// Run simulation loop
console.log(`🚜 Starting Simulator for ${DEVICE_ID}...`);
console.log(`📡 Sending critical data to ${SERVER_URL}`);

// Send immediately
simulateData();

// Then every 5 seconds
setInterval(simulateData, 5000);
