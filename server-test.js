// Simple MQTT Server for Testing (No Prisma)
// This is a lightweight version for immediate device testing

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const aedes = require('aedes')()
const { createServer } = require('net')

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

    console.log(`📨 MQTT Message - Topic: ${topic}`)
    console.log(`📦 Payload: ${payload}`)

    try {
        // Parse topic: smartag/{deviceId}/sensors
        const topicParts = topic.split('/')

        if (topicParts[0] === 'smartag' && topicParts[2] === 'sensors') {
            const deviceId = topicParts[1]
            const data = JSON.parse(payload)

            console.log(`✅ Sensor data received from device: ${deviceId}`)
            console.log(`   Temperature: ${data.temperature}°C`)
            console.log(`   Humidity: ${data.humidity}%`)
            console.log(`   Moisture: ${data.moisture}%`)

            // Broadcast to connected dashboard clients
            io.emit('sensorData', {
                deviceId,
                ...data,
                timestamp: new Date().toISOString()
            })
        }

        // Handle pump commands
        if (topicParts[0] === 'smartag' && topicParts[2] === 'pump') {
            const deviceId = topicParts[1]
            const data = JSON.parse(payload)

            console.log(`💧 Pump status received from device: ${deviceId}`)
            console.log(`   Action: ${data.action}`)

            // Broadcast to dashboard
            io.emit('pumpStatus', {
                deviceId,
                ...data
            })
        }
    } catch (error) {
        console.error('❌ Error processing MQTT message:', error.message)
    }
})

// ============================================
// REST API Endpoints
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mqtt: 'Running',
        socketio: 'Running'
    })
})

// Control pump
app.post('/api/devices/:deviceId/pump', async (req, res) => {
    try {
        const { deviceId } = req.params
        const { status, duration } = req.body

        console.log(`💧 Pump command received for ${deviceId}: ${status}`)

        // Publish MQTT command to device
        const topic = `smartag/${deviceId}/pump/command`
        const message = JSON.stringify({ status, duration: duration || 0 })

        aedes.publish({
            topic,
            payload: Buffer.from(message),
            qos: 1,
            retain: false
        })

        res.json({ success: true, message: 'Pump command sent' })
    } catch (error) {
        console.error('Error controlling pump:', error)
        res.status(500).json({ error: 'Failed to control pump' })
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
    mqttServer.close()
    httpServer.close()
    process.exit(0)
})

console.log('🚀 Smart Agriculture Backend Server Started (Test Mode)')
console.log(`📡 MQTT Broker: mqtt://localhost:${MQTT_PORT}`)
console.log(`🌐 HTTP API: http://localhost:${PORT}`)
console.log(`🔌 Socket.io: http://localhost:${PORT}`)
console.log('\n⚠️  Running in TEST MODE - No database persistence')
console.log('   Data will only be visible in real-time\n')
