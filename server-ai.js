// server-ai.js - Smart Agriculture IoT Backend with AI Integration (No Prisma version)
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const aedes = require('aedes')()
const { createServer } = require('net')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Express app setup
const app = express()
app.use(cors())
app.use(express.json())

// Global Logger
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`)
    next()
})

// HTTP Server
const PORT = process.env.SOCKET_PORT || 5000
const httpServer = app.listen(PORT, () => {
    console.log(`✅ HTTP Server running on port ${PORT}`)
})

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

// MQTT Broker setup
const MQTT_PORT = process.env.MQTT_PORT || 1883
const mqttServer = createServer(aedes.handle)

mqttServer.listen(MQTT_PORT, () => {
    console.log(`✅ MQTT Broker running on port ${MQTT_PORT}`)
})

// Store for real-time analytics (In-memory since no DB for now)
let lastAIAnalysis = {}
let alerts = []

// ============================================
// MQTT Event Handlers
// ============================================

aedes.on('publish', async (packet, client) => {
    console.log(`📨 Global MQTT: ${packet.topic}`)

    if (!client) return
    const topic = packet.topic
    const payload = packet.payload.toString()

    try {
        const topicParts = topic.split('/')
        if (topicParts[0] === 'smartag' && topicParts[2] === 'sensors') {
            const deviceId = topicParts[1]
            const data = JSON.parse(payload)

            // 🤖 AI SERVICE INTEGRATION
            let aiAnalysis = { soilHealth: 'Unknown', stressLevel: 0 }
            try {
                const aiResponse = await fetch('http://localhost:8000/api/ai/interpret', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId, sensorData: data })
                })

                if (aiResponse.ok) {
                    aiAnalysis = await aiResponse.json()
                    console.log(`🤖 AI Analysis: Health=${aiAnalysis.soilHealth}, Stress=${aiAnalysis.stressLevel}%`)

                    // 🚀 SMART TRIGGER ENGINE
                    // If moisture < 30% OR AI Stress > 70%, trigger automated irrigation
                    if (data.moisture < 30 || aiAnalysis.stressLevel > 70) {
                        const irrigationTopic = `smartag/${deviceId}/pump/command`
                        const command = JSON.stringify({ status: 'ON', duration: 300, triggeredBy: 'AI_AGENT' })

                        aedes.publish({
                            topic: irrigationTopic,
                            payload: Buffer.from(command),
                            qos: 1,
                            retain: false
                        })

                        console.log(`💧 [AUTOMATION] Triggered 5min irrigation for ${deviceId} (Reason: ${data.moisture < 30 ? 'Low Moisture' : 'High AI Stress'})`)

                        alerts.unshift({
                            id: Date.now().toString() + '_auto',
                            title: 'Automated Irrigation Started',
                            message: `AI triggered 5min cycle for ${deviceId}.`,
                            severity: 'INFO',
                            createdAt: new Date().toISOString(),
                            isRead: false
                        })
                    } else if (aiAnalysis.stressLevel > 50) {
                        // Just regular alert if not critical enough for auto-pump
                        alerts.unshift({
                            id: Date.now().toString(),
                            title: 'High Stress Detected',
                            message: `Plant in sector ${deviceId} is at ${aiAnalysis.stressLevel}% stress.`,
                            severity: 'CRITICAL',
                            createdAt: new Date().toISOString(),
                            isRead: false
                        })
                    }
                }
            } catch (err) {
                console.warn('⚠️ AI service unavailable')
            }

            // Broadcast to dashboard
            io.emit('sensorData', {
                deviceId,
                ...data,
                ai: aiAnalysis,
                timestamp: new Date().toISOString()
            })

            lastAIAnalysis[deviceId] = aiAnalysis
            io.emit('aiUpdate', aiAnalysis)
        }
    } catch (error) {
        console.error('❌ MQTT Error:', error.message)
    }
})

// ============================================
// API Endpoints for Dashboard
// ============================================

app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

app.get('/api/alerts', (req, res) => res.json(alerts))

// Get dummy devices for Lite mode
app.get('/api/devices', (req, res) => {
    res.json([
        { id: 'dev-1', device_id: 'SMARTAG-001', deviceId: 'SMARTAG-001', name: 'Main Sensor Pod', status: 'ACTIVE', type: 'COMBO' },
        { id: 'dev-2', device_id: 'SMARTAG-002', deviceId: 'SMARTAG-002', name: 'Irrigation Controller', status: 'ACTIVE', type: 'PUMP' }
    ])
})

// Get dummy expenses for Lite mode
app.get('/api/expenses', (req, res) => {
    res.json([
        { id: 'exp-1', title: 'Power Bill', category: 'Utility', amount: 45.50, date: new Date().toISOString() },
        { id: 'exp-2', title: 'Fertilizer Mix', category: 'Supplies', amount: 120.00, date: new Date().toISOString() },
        { id: 'exp-3', title: 'Water Usage', category: 'Utility', amount: 30.25, date: new Date().toISOString() }
    ])
})



// Weather API endpoint
let weatherCache = { data: null, timestamp: null }
const WEATHER_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

app.get('/api/weather', async (req, res) => {
    try {
        if (weatherCache.data && weatherCache.timestamp && (Date.now() - weatherCache.timestamp < WEATHER_CACHE_DURATION)) {
            return res.json(weatherCache.data)
        }

        const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key'
        const rawLocation = req.query.location || 'Phnom Penh,KH'
        const location = encodeURIComponent(rawLocation)

        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        )

        if (!currentResponse.ok) throw new Error('Weather API unavailable')
        const currentData = await currentResponse.json()

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        )
        const forecastData = await forecastResponse.json()

        const dailyForecasts = []
        const processedDates = new Set()

        if (forecastData.list) {
            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000).toISOString().split('T')[0]
                if (!processedDates.has(date) && dailyForecasts.length < 3) {
                    processedDates.add(date)
                    const dayEntries = forecastData.list.filter(entry => new Date(entry.dt * 1000).toISOString().split('T')[0] === date)
                    const temps = dayEntries.map(e => e.main.temp)
                    dailyForecasts.push({
                        date,
                        tempMax: Math.max(...temps),
                        tempMin: Math.min(...temps),
                        condition: item.weather[0].description,
                        rainProbability: Math.round(Math.max(...dayEntries.map(e => (e.pop || 0) * 100))),
                        humidity: item.main.humidity,
                        windSpeed: item.wind.speed
                    })
                }
            })
        }

        const weatherData = {
            current: {
                location: currentData.name,
                temperature: currentData.main.temp,
                condition: currentData.weather[0].description,
                humidity: currentData.main.humidity,
                windSpeed: currentData.wind.speed,
                timestamp: new Date().toISOString()
            },
            forecast: dailyForecasts
        }

        weatherCache = { data: weatherData, timestamp: Date.now() }
        res.json(weatherData)
    } catch (error) {
        console.error('Weather API error:', error.message)
        const demoData = {
            current: { location: 'Phnom Penh', temperature: 31, condition: 'sunny', humidity: 65, windSpeed: 12, timestamp: new Date().toISOString() },
            forecast: [
                { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], tempMax: 32, tempMin: 22, condition: 'partly cloudy', rainProbability: 20 },
                { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], tempMax: 31, tempMin: 25, condition: 'cloudy', rainProbability: 40 }
            ]
        }
        res.json(demoData)
    }
})

app.get('/api/zones', (req, res) => {
    // Return dummy zones for dashboard UI
    res.json([
        { id: 'zone-a', name: 'Zone A - Rice' },
        { id: 'zone-b', name: 'Zone B - Tomato' }
    ])
})

app.get('/api/ai/predictions/:zoneId', (req, res) => {
    // Generate semi-random predictions for a more "live" feel
    const baseVal = 45 + Math.random() * 20
    const predictions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
        day,
        predicted: Math.max(0, Math.min(100, Math.round(baseVal - (i * (3 + Math.random() * 2)))))
    }))

    res.json({
        zoneId: req.params.zoneId,
        predictions
    })
})

app.get('/api/ai/digital-twin/:zoneId', (req, res) => {
    res.json({
        zoneId: req.params.zoneId,
        layout: [
            { x: 10, y: 10, health: 85, type: 'CROP' },
            { x: 50, y: 10, health: 92, type: 'CROP' },
            { x: 90, y: 10, health: 78, type: 'CROP' },
            { x: 10, y: 50, health: 65, type: 'SENSOR' },
            { x: 50, y: 50, health: 40, type: 'DRY_ZONE' },
            { x: 90, y: 50, health: 88, type: 'CROP' },
        ],
        lastUpdate: new Date().toISOString()
    })
})

console.log('🚀 AI-Ready Backend Server (Lite) Started')
console.log('⚠️  DB persistence disabled to bypass Prisma issues')
