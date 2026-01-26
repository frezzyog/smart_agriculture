const mqtt = require('mqtt');

// Connect to the local MQTT broker we started in server-ai.js
const client = mqtt.connect('mqtt://localhost:1883');

const DEVICED_ID = 'device-001';
const ZONE_ID = 'zone-a';

console.log('🚜 IoT Simulator Starting...');
console.log('📍 Simulating Device: ' + DEVICED_ID);

let moisture = 75.0; // Starting moisture
let temperature = 25.0;

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker');

    // Start sending data every 5 seconds
    setInterval(() => {
        // Simulate things drying out
        moisture -= (Math.random() * 0.5);
        if (moisture < 10) moisture = 80; // Reset if completely dry

        // Random temperature fluctuation
        temperature += (Math.random() - 0.5);

        const payload = {
            temperature: parseFloat(temperature.toFixed(1)),
            humidity: 60 + (Math.random() * 10),
            moisture: parseFloat(moisture.toFixed(1)),
            nitrogen: 45 + Math.random(),
            phosphorus: 30 + Math.random(),
            potassium: 20 + Math.random(),
            pH: 6.5 + (Math.random() * 0.2)
        };

        const topic = `smartag/${DEVICED_ID}/sensors`;

        client.publish(topic, JSON.stringify(payload), { qos: 1 }, () => {
            console.log(`📡 Data Published [${new Date().toLocaleTimeString()}]: Moisture=${payload.moisture}% Temp=${payload.temperature}°C`);

            if (moisture < 30) {
                console.log('⚠️  MOISTURE CRITICAL: Triggering AI logical alert...');
            }
        });
    }, 5000);
});

// Listen for the AI's "PUMP ON" commands
client.subscribe(`smartag/${DEVICED_ID}/pump/command`);

client.on('message', (topic, message) => {
    if (topic.includes('pump/command')) {
        const cmd = JSON.parse(message.toString());
        console.log(`\n💧 [RECEIVED COMMAND]: PUMP is now ${cmd.status} for ${cmd.duration}s`);
        console.log(`🤖 Triggered by: ${cmd.triggeredBy}`);

        if (cmd.status === 'ON') {
            console.log('➕ Refilling soil moisture...');
            moisture += 15; // Simulate the pump actually helping
        }
    }
});
