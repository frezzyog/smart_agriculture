// server-supabase.js - Smart Agriculture IoT Backend Server (Supabase Direct)
// Uses Supabase JS client instead of Prisma for database operations
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const aedes = require('aedes')()
const { createServer } = require('net')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch(() => global.fetch);


// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

console.log('🔗 Supabase URL:', process.env.SUPABASE_URL)

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

            // Log pump action (now includes pump type: Water/Fertilizer)
            await logPumpAction(deviceId, {
                action: data.status || data.action || 'OFF',
                duration: data.duration || null,
                triggeredBy: data.triggeredBy || 'device',
                type: data.type || 'WATER'
            })

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
// Database Functions (using Supabase)
// ============================================

async function saveSensorData(deviceId, data) {
    try {
        // Find device by deviceId
        let { data: device, error: deviceError } = await supabase
            .from('devices')
            .select('id, user_id')
            .eq('device_id', deviceId)
            .single()

        if (deviceError || !device) {
            console.warn(`⚠️ Device not found: ${deviceId}, auto-registering...`)

            // Try to find or create a user to associate with
            const { data: users } = await supabase.from('users').select('id').limit(1)
            let defaultUserId = users && users.length > 0 ? users[0].id : null

            if (!defaultUserId) {
                console.log('👤 No users found. Creating default system user...')
                defaultUserId = crypto.randomUUID()
                await supabase.from('users').insert({
                    id: defaultUserId,
                    email: 'admin@smartag.com',
                    name: 'System Admin',
                    password: 'hashed_password_here',
                    role: 'ADMIN',
                    updated_at: new Date().toISOString()
                })
            }

            const deviceUuid = crypto.randomUUID()
            const insertData = {
                id: deviceUuid,
                device_id: deviceId,
                name: `Device ${deviceId}`,
                type: 'COMBO',
                status: 'ACTIVE',
                user_id: defaultUserId,
                updated_at: new Date().toISOString()
            }

            const { error: createError } = await supabase
                .from('devices')
                .insert(insertData)

            if (createError) {
                console.error('❌ Auto-registration failed:', createError.message)
                // Fallback: This is risky but helps bypass FK error if we can use the UUID we just created
                device = { id: deviceUuid, user_id: defaultUserId }
            } else {
                device = { id: deviceUuid, user_id: defaultUserId }
                console.log(`✅ Device auto-registered: ${deviceId} (UUID: ${deviceUuid})`)
            }
        }

        const actualDevice = device;

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

                // --- AUTOMATED AI CONTROL ---
                if (aiAnalysis.recommendAction && aiAnalysis.action) {
                    console.log(`🤖 AI RECOMMENDATION: Triggering ${aiAnalysis.action.type}...`)

                    const { command } = aiAnalysis.action
                    const topic = `smartag/${deviceId}/pump/command`

                    // Publish MQTT command to device
                    aedes.publish({
                        topic,
                        payload: Buffer.from(JSON.stringify(command)),
                        qos: 1,
                        retain: false
                    })

                    // Log the automated action
                    await logPumpAction(deviceId, {
                        type: command.type || 'WATER',
                        action: command.status,
                        duration: command.duration,
                        triggeredBy: 'AI_SYSTEM'
                    })
                }
            }
        } catch (aiError) {
            console.warn('⚠️ AI service unavailable:', aiError.message)
        }

        // Save sensor data
        const { error: insertError } = await supabase
            .from('sensor_data')
            .insert({
                id: crypto.randomUUID(),
                device_id: actualDevice.id,
                temperature: data.temperature || null,
                humidity: data.humidity || null,
                moisture: data.moisture || null,
                rain: data.rain || null,
                light_intensity: data.lightIntensity || null,
                nitrogen: data.nitrogen || null,
                phosphorus: data.phosphorus || null,
                potassium: data.potassium || null,
                pH: data.pH || null,
                ec: data.ec || null, // New field for 7-in-1 sensor
                soil_health: aiAnalysis?.soilHealth || null,
                stress_level: aiAnalysis?.stressLevel || null,
                moisture_loss_rate: aiAnalysis?.moistureLossRate || null,
                timestamp: new Date().toISOString()
            })

        if (insertError) {
            console.error('❌ Error saving sensor data:', insertError.message)
            return
        }

        // Update device status to ACTIVE
        await supabase
            .from('devices')
            .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
            .eq('device_id', deviceId)

        console.log(`✅ Sensor data saved for device: ${deviceId}`)
    } catch (error) {
        console.error('❌ Error saving sensor data:', error)
    }
}

async function logPumpAction(deviceId, data) {
    try {
        const { data: device } = await supabase
            .from('devices')
            .select('id')
            .eq('device_id', deviceId)
            .single()

        if (!device) return

        await supabase
            .from('pump_logs')
            .insert({
                id: crypto.randomUUID(),
                device_id: device.id,
                action: data.action || 'OFF',
                duration: data.duration || null,
                triggered_by: data.triggeredBy || 'manual',
                metadata: {
                    pump_type: data.type || 'WATER'
                },
                timestamp: new Date().toISOString()
            })

        console.log(`✅ ${data.type || 'WATER'} Pump action logged for device: ${deviceId}`)
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

// Get all devices
app.get('/api/devices', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']

        let query = supabase.from('devices').select('*')
        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data: devices, error } = await query

        if (error) throw error
        res.json(devices || [])
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

        // Find device
        const { data: device } = await supabase
            .from('devices')
            .select('id')
            .eq('device_id', deviceId)
            .single()

        if (!device) {
            return res.status(404).json({ error: 'Device not found' })
        }

        const { data: sensorData, error } = await supabase
            .from('sensor_data')
            .select('*')
            .eq('device_id', device.id)
            .order('timestamp', { ascending: false })
            .limit(limit)

        if (error) throw error
        res.json(sensorData || [])
    } catch (error) {
        console.error('Error fetching sensor data:', error)
        res.status(500).json({ error: 'Failed to fetch sensor data' })
    }
})

// Control pump
app.post('/api/devices/:deviceId/pump', async (req, res) => {
    try {
        const { deviceId } = req.params
        const { status, duration, type } = req.body // 'type' should be 'WATER' or 'FERTILIZER'

        // Publish MQTT command to device
        const topic = `smartag/${deviceId}/pump/command`
        const message = JSON.stringify({
            type: type || 'WATER',
            status,
            duration: duration || 0
        })

        aedes.publish({
            topic,
            payload: Buffer.from(message),
            qos: 1,
            retain: false
        })

        // Log pump action
        await logPumpAction(deviceId, {
            type: type || 'WATER',
            action: status,
            duration,
            triggeredBy: 'dashboard'
        })

        res.json({ success: true, message: `${type || 'Water'} Pump command sent` })
    } catch (error) {
        console.error('Error controlling pump:', error)
        res.status(500).json({ error: 'Failed to control pump' })
    }
})

// Get alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']
        const unreadOnly = req.query.unreadOnly === 'true'

        let query = supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (userId) {
            query = query.eq('user_id', userId)
        }
        if (unreadOnly) {
            query = query.eq('is_read', false)
        }

        const { data: alerts, error } = await query

        if (error) throw error
        res.json(alerts || [])
    } catch (error) {
        console.error('Error fetching alerts:', error)
        res.status(500).json({ error: 'Failed to fetch alerts' })
    }
})

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']

        let query = supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false })

        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data: expenses, error } = await query

        if (error) throw error
        res.json(expenses || [])
    } catch (error) {
        console.error('Error fetching expenses:', error)
        res.status(500).json({ error: 'Failed to fetch expenses' })
    }
})

// Create new expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { title, category, amount, date, userId } = req.body
        const user_id = userId || req.headers['x-user-id']

        if (!user_id) {
            // Fallback to first user if none provided
            const { data: users } = await supabase.from('users').select('id').limit(1)
            const fallbackUserId = users && users.length > 0 ? users[0].id : null
            if (!fallbackUserId) throw new Error('No user found')
            req.body.user_id = fallbackUserId
        } else {
            req.body.user_id = user_id
        }

        const { data: expense, error } = await supabase
            .from('expenses')
            .insert({
                id: crypto.randomUUID(),
                user_id: req.body.user_id,
                title,
                category,
                amount,
                date: date || new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        res.json(expense)
    } catch (error) {
        console.error('Error creating expense:', error)
        res.status(500).json({ error: 'Failed to create expense' })
    }
})

// Get zones
app.get('/api/zones', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']

        let query = supabase.from('zones').select('*')
        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data: zones, error } = await query

        if (error) throw error
        res.json(zones || [])
    } catch (error) {
        console.error('Error fetching zones:', error)
        res.status(500).json({ error: 'Failed to fetch zones' })
    }
})

// AI Predictions endpoint - proxy to AI service or return stored predictions
app.get('/api/ai/predictions/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params

        // Get latest sensor data to generate predictions
        const { data: devices } = await supabase.from('devices').select('id').limit(1)

        if (!devices || devices.length === 0) {
            return res.json({
                zoneId,
                predictions: [],
                confidence: 0.85,
                generatedAt: new Date().toISOString()
            })
        }

        // Get recent sensor data for predictions
        const { data: sensorData } = await supabase
            .from('sensor_data')
            .select('*')
            .eq('device_id', devices[0].id)
            .order('timestamp', { ascending: false })
            .limit(7)

        // Generate simple moisture predictions based on historical data
        const predictions = []
        const baseDate = new Date()
        const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            const predDate = new Date(baseDate)
            predDate.setDate(predDate.getDate() + i)

            const avgMoisture = sensorData && sensorData.length > 0
                ? sensorData.reduce((sum, d) => sum + (d.moisture || 50), 0) / sensorData.length
                : 50

            // Simulate moisture decay over time
            const predictedMoisture = Math.max(10, avgMoisture - (i * 3))

            predictions.push({
                day: daysShort[predDate.getDay()],
                predicted: Math.round(predictedMoisture),
                irrigationNeeded: predictedMoisture < 30
            })
        }

        res.json({
            zoneId,
            predictions,
            confidence: 0.85,
            generatedAt: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error fetching AI predictions:', error)
        res.status(500).json({ error: 'Failed to fetch predictions' })
    }
})

// Digital Twin endpoint
app.get('/api/ai/digital-twin/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params

        // Get latest sensor data for digital twin
        const { data: devices } = await supabase.from('devices').select('id').limit(1)

        if (!devices || devices.length === 0) {
            return res.json({
                health: 'unknown',
                efficiency: 0,
                lastUpdated: new Date().toISOString(),
                layout: []
            })
        }

        const { data: sensorData } = await supabase
            .from('sensor_data')
            .select('*')
            .eq('device_id', devices[0].id)
            .order('timestamp', { ascending: false })
            .limit(1)

        const latest = sensorData && sensorData.length > 0 ? sensorData[0] : null

        // Generate digital twin layout based on sensor data
        const layout = [
            { x: 30, y: 40, type: 'CROP', health: latest?.moisture > 50 ? 92 : 60 },
            { x: 70, y: 30, type: 'CROP', health: latest?.moisture > 40 ? 88 : 55 },
            { x: 50, y: 60, type: 'SENSOR', health: 100 },
            { x: 20, y: 80, type: latest?.moisture < 30 ? 'DRY_ZONE' : 'CROP', health: latest?.moisture || 45 },
            { x: 80, y: 70, type: 'CROP', health: latest?.moisture > 45 ? 95 : 65 }
        ]

        res.json({
            health: latest?.soil_health || 'optimal',
            efficiency: latest?.moisture ? (latest.moisture / 100) : 0.94,
            lastUpdated: latest?.timestamp || new Date().toISOString(),
            layout
        })
    } catch (error) {
        console.error('Error fetching digital twin:', error)
        res.status(500).json({ error: 'Failed to fetch digital twin' })
    }
})

// Register new device
app.post('/api/devices/register', async (req, res) => {
    try {
        const { deviceId, name, type, location, userId } = req.body

        const { data: device, error } = await supabase
            .from('devices')
            .insert({
                device_id: deviceId,
                name,
                type: type || 'COMBO',
                location,
                user_id: userId,
                status: 'INACTIVE'
            })
            .select()
            .single()

        if (error) throw error
        res.json(device)
    } catch (error) {
        console.error('Error registering device:', error)
        res.status(500).json({ error: 'Failed to register device' })
    }
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

// Chatbot endpoint with context
app.post('/api/chat', async (req, res) => {
    try {
        const { message, deviceId } = req.body
        const userId = req.headers['x-user-id']

        // 1. Get latest sensor context
        let sensorContext = {}
        if (deviceId) {
            const { data: latestData } = await supabase
                .from('sensor_data')
                .select('*')
                .eq('device_id', deviceId) // Assuming UUID here, or join from device_id string
                .order('timestamp', { ascending: false })
                .limit(1)
                .single()
            sensorContext = latestData || {}
        }

        // 2. Get financial context
        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .limit(10)

        // 3. Forward to AI Service
        const aiResponse = await fetch('http://localhost:8000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                context: {
                    sensorData: sensorContext,
                    expenses: expenses || []
                }
            })
        })

        const data = await aiResponse.json()
        res.json(data)
    } catch (error) {
        console.error('Chat error:', error)
        res.status(500).json({ reply: "I'm having trouble connecting to my central brain. Please try again in a moment." })
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

console.log('🚀 Smart Agriculture Backend Server Started (Supabase Mode)')
console.log(`📡 MQTT Broker: mqtt://localhost:${MQTT_PORT}`)
console.log(`🌐 HTTP API: http://localhost:${PORT}`)
console.log(`🔌 Socket.io: http://localhost:${PORT}`)
