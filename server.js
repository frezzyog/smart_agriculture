// server.js - Smart Agriculture IoT Backend Server
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const aedes = require('aedes')()
const { createServer } = require('net')
const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')

// Initialize Prisma and Supabase
const prisma = new PrismaClient()
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)


// Express app setup
const app = express()
app.use(cors())
app.use(express.json())

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

// ============================================
// MQTT Event Handlers
// ============================================

aedes.on('client', (client) => {
    console.log(`📡 Client Connected: ${client.id}`)
})

aedes.on('clientDisconnect', (client) => {
    console.log(`📴 Client Disconnected: ${client.id}`)
})

aedes.on('publish', async (packet, client) => {
    if (!client) return // Ignore broker messages

    const topic = packet.topic
    const payload = packet.payload.toString()

    console.log(`📨 MQTT Message - Topic: ${topic}, Payload: ${payload}`)

    try {
        // Parse topic: smartag/{deviceId}/sensors
        const topicParts = topic.split('/')

        if (topicParts[0] === 'smartag' && topicParts[2] === 'sensors') {
            const deviceId = topicParts[1]
            const data = JSON.parse(payload)

            // Store sensor data in database
            await saveSensorData(deviceId, data)

            // Broadcast to connected dashboard clients
            io.emit('sensorData', {
                deviceId,
                ...data,
                timestamp: new Date().toISOString()
            })
        }

        // Handle pump commands: smartag/{deviceId}/pump/status
        if (topicParts[0] === 'smartag' && topicParts[2] === 'pump') {
            const deviceId = topicParts[1]
            const data = JSON.parse(payload)

            // Log pump action
            await logPumpAction(deviceId, data)

            // Broadcast to dashboard
            io.emit('pumpStatus', {
                deviceId,
                ...data
            })
        }
    } catch (error) {
        console.error('❌ Error processing MQTT message:', error)
    }
})

// ============================================
// Database Functions
// ============================================

async function saveSensorData(deviceId, data) {
    try {
        // Find device by deviceId
        const device = await prisma.device.findUnique({
            where: { deviceId }
        })

        if (!device) {
            console.warn(`⚠️ Device not found: ${deviceId}`)
            return
        }

        // Call AI service for real-time interpretation
        let aiAnalysis = null
        try {
            const aiResponse = await fetch('http://localhost:8000/api/ai/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    sensorData: data
                })
            })

            if (aiResponse.ok) {
                aiAnalysis = await aiResponse.json()
                console.log(`🤖 AI Analysis: Soil Health=${aiAnalysis.soilHealth}, Stress=${aiAnalysis.stressLevel}%`)
            }
        } catch (aiError) {
            console.warn('⚠️ AI service unavailable:', aiError.message)
        }

        // Save sensor data with AI-generated insights
        await prisma.sensorData.create({
            data: {
                deviceId: device.id,
                temperature: data.temperature || null,
                humidity: data.humidity || null,
                moisture: data.moisture || null,
                rain: data.rain || null,
                lightIntensity: data.lightIntensity || null,
                nitrogen: data.nitrogen || null,
                phosphorus: data.phosphorus || null,
                potassium: data.potassium || null,
                pH: data.pH || null,
                // AI-generated fields
                soilHealth: aiAnalysis?.soilHealth || null,
                stressLevel: aiAnalysis?.stressLevel || null,
                moistureLossRate: aiAnalysis?.moistureLossRate || null,
                timestamp: new Date()
            }
        })

        // Create alerts from AI analysis
        if (aiAnalysis && aiAnalysis.alerts.length > 0) {
            for (const alert of aiAnalysis.alerts) {
                await prisma.alert.create({
                    data: {
                        deviceId: device.id,
                        userId: device.userId,
                        severity: alert.severity || 'INFO',
                        type: alert.type || 'SYSTEM_INFO',
                        title: alert.title,
                        message: alert.message,
                        metadata: JSON.stringify(data)
                    }
                })
            }

            // Broadcast alerts to dashboard
            io.to(`user:${device.userId}`).emit('newAlert', {
                alerts: aiAnalysis.alerts,
                deviceId
            })
        }

        // Execute automated action if AI recommends it
        if (aiAnalysis && aiAnalysis.recommendAction && aiAnalysis.action) {
            console.log(`🤖 AI recommends action: ${aiAnalysis.action.type}`)

            if (aiAnalysis.action.type === 'irrigation') {
                // Publish pump control command
                const topic = `smartag/${deviceId}/pump/command`
                const command = aiAnalysis.action.command

                aedes.publish({
                    topic,
                    payload: Buffer.from(JSON.stringify(command)),
                    qos: 1,
                    retain: false
                })

                console.log(`💧 Auto-irrigation triggered: ${command.duration}s`)
            }
        }

        // Update device status to ACTIVE
        await prisma.device.update({
            where: { id: device.id },
            data: { status: 'ACTIVE', updatedAt: new Date() }
        })

        console.log(`✅ Sensor data saved for device: ${deviceId}`)
    } catch (error) {
        console.error('❌ Error saving sensor data:', error)
    }
}

async function logPumpAction(deviceId, data) {
    try {
        const device = await prisma.device.findUnique({
            where: { deviceId }
        })

        if (!device) return

        await prisma.pumpLog.create({
            data: {
                deviceId: device.id,
                action: data.action || 'OFF',
                duration: data.duration || null,
                triggeredBy: data.triggeredBy || 'manual',
                timestamp: new Date()
            }
        })

        console.log(`✅ Pump action logged for device: ${deviceId}`)
    } catch (error) {
        console.error('❌ Error logging pump action:', error)
    }
}

// ============================================
// REST API Endpoints
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Get all devices for a user
app.get('/api/devices', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']

        const devices = await prisma.device.findMany({
            where: userId ? { userId } : {},
            include: {
                sensorData: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                }
            }
        })

        res.json(devices)
    } catch (error) {
        console.error('Error fetching devices:', error)
        res.status(500).json({ error: 'Failed to fetch devices' })
    }
})

// Get sensor data for a specific device
app.get('/api/sensors/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params
        const limit = parseInt(req.query.limit) || 100

        const device = await prisma.device.findUnique({
            where: { deviceId }
        })

        if (!device) {
            return res.status(404).json({ error: 'Device not found' })
        }

        const sensorData = await prisma.sensorData.findMany({
            where: { deviceId: device.id },
            orderBy: { timestamp: 'desc' },
            take: limit
        })

        res.json(sensorData)
    } catch (error) {
        console.error('Error fetching sensor data:', error)
        res.status(500).json({ error: 'Failed to fetch sensor data' })
    }
})

// Control pump
app.post('/api/devices/:deviceId/pump', async (req, res) => {
    try {
        const { deviceId } = req.params
        const { status, duration } = req.body

        // Publish MQTT command to device
        const topic = `smartag/${deviceId}/pump/command`
        const message = JSON.stringify({ status, duration: duration || 0 })

        aedes.publish({
            topic,
            payload: Buffer.from(message),
            qos: 1,
            retain: false
        })

        // Log pump action
        await logPumpAction(deviceId, {
            action: status,
            duration,
            triggeredBy: 'dashboard'
        })

        res.json({ success: true, message: 'Pump command sent' })
    } catch (error) {
        console.error('Error controlling pump:', error)
        res.status(500).json({ error: 'Failed to control pump' })
    }
})

// Get alerts for a user
app.get('/api/alerts', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']
        const unreadOnly = req.query.unreadOnly === 'true'

        const alerts = await prisma.alert.findMany({
            where: {
                userId,
                ...(unreadOnly ? { isRead: false } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                device: {
                    select: { name: true, deviceId: true }
                }
            }
        })

        res.json(alerts)
    } catch (error) {
        console.error('Error fetching alerts:', error)
        res.status(500).json({ error: 'Failed to fetch alerts' })
    }
})

// Mark alert as read
app.patch('/api/alerts/:alertId/read', async (req, res) => {
    try {
        const { alertId } = req.params

        const alert = await prisma.alert.update({
            where: { id: alertId },
            data: { isRead: true, readAt: new Date() }
        })

        res.json(alert)
    } catch (error) {
        console.error('Error updating alert:', error)
        res.status(500).json({ error: 'Failed to update alert' })
    }
})

// Get AI predictions for a zone
app.get('/api/ai/predictions/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params
        const type = req.query.type // 'irrigation' or 'fertilizer'

        const predictions = await prisma.prediction.findMany({
            where: {
                zoneId,
                ...(type ? { predictionType: type.toUpperCase() } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        res.json(predictions)
    } catch (error) {
        console.error('Error fetching predictions:', error)
        res.status(500).json({ error: 'Failed to fetch predictions' })
    }
})

// Generate new AI prediction
app.post('/api/ai/predictions/generate', async (req, res) => {
    try {
        const { zoneId, type, days } = req.body

        // Call AI service
        const endpoint = type === 'irrigation'
            ? '/api/ai/predict/irrigation'
            : '/api/ai/predict/fertilizer'

        const aiResponse = await fetch(`http://localhost:8000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zoneId, days: days || 7 })
        })

        const aiPrediction = await aiResponse.json()

        // Store prediction in database
        const prediction = await prisma.prediction.create({
            data: {
                zoneId,
                predictionType: type.toUpperCase(),
                confidence: aiPrediction.confidence || 0.5,
                predictedValue: aiPrediction.predictions,
                validUntil: new Date(Date.now() + (days || 7) * 24 * 60 * 60 * 1000)
            }
        })

        res.json(prediction)
    } catch (error) {
        console.error('Error generating prediction:', error)
        res.status(500).json({ error: 'Failed to generate prediction' })
    }
})

// Get user zones
app.get('/api/zones', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']

        const zones = await prisma.zone.findMany({
            where: { userId },
            include: {
                devices: {
                    select: { id: true, name: true, deviceId: true, status: true }
                },
                _count: {
                    select: { predictions: true }
                }
            }
        })

        res.json(zones)
    } catch (error) {
        console.error('Error fetching zones:', error)
        res.status(500).json({ error: 'Failed to fetch zones' })
    }
})

// Create zone
app.post('/api/zones/create', async (req, res) => {
    try {
        const { name, userId, area, soilType, cropType, optimalMoisture } = req.body

        const zone = await prisma.zone.create({
            data: {
                name,
                userId,
                area: area || null,
                soilType: soilType || null,
                cropType: cropType || null,
                optimalMoisture: optimalMoisture || 60
            }
        })

        res.json(zone)
    } catch (error) {
        console.error('Error creating zone:', error)
        res.status(500).json({ error: 'Failed to create zone' })
    }
})

// Register new device
app.post('/api/devices/register', async (req, res) => {
    try {
        const { deviceId, name, type, location, userId } = req.body

        const device = await prisma.device.create({
            data: {
                deviceId,
                name,
                type: type || 'COMBO',
                location,
                userId,
                status: 'INACTIVE'
            }
        })

        res.json(device)
    } catch (error) {
        console.error('Error registering device:', error)
        res.status(500).json({ error: 'Failed to register device' })
    }
})

// ============================================
// Socket.io Connections
// ============================================

io.on('connection', (socket) => {
    console.log(`🔌 Dashboard client connected: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`🔌 Dashboard client disconnected: ${socket.id}`)
    })

    // Subscribe to specific device updates
    socket.on('subscribe', (deviceId) => {
        socket.join(`device:${deviceId}`)
        console.log(`📍 Client subscribed to device: ${deviceId}`)
    })
})

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...')
    await prisma.$disconnect()
    mqttServer.close()
    httpServer.close()
    process.exit(0)
})

console.log('🚀 Smart Agriculture Backend Server Started')
console.log(`📡 MQTT Broker: mqtt://localhost:${MQTT_PORT}`)
console.log(`🌐 HTTP API: http://localhost:${PORT}`)
console.log(`🔌 Socket.io: http://localhost:${PORT}`)
