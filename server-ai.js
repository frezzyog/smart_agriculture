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
