// server.js - Smart Agriculture IoT Backend Server
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const aedes = require('aedes')()
const { createServer } = require('net')
const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
const twilio = require('twilio')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch(() => global.fetch);


// Initialize Twilio
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER

console.log(`🔍 [DEBUG] Checking SMS Config: SID=${TWILIO_SID ? TWILIO_SID.substring(0, 5) + '...' : 'MISSING'}, Token=${TWILIO_TOKEN ? 'PRESENT' : 'MISSING'}, Phone=${TWILIO_PHONE || 'MISSING'}`)

const smsClient = (TWILIO_SID && !TWILIO_SID.includes('xxx') && TWILIO_TOKEN && !TWILIO_TOKEN.includes('xxx'))
    ? twilio(TWILIO_SID, TWILIO_TOKEN)
    : null

if (smsClient) {
    console.log('✅ Twilio SMS Client initialized')
} else {
    let reason = 'Unknown'
    if (!TWILIO_SID) reason = 'TWILIO_ACCOUNT_SID is missing'
    else if (TWILIO_SID.includes('xxx')) reason = 'TWILIO_ACCOUNT_SID contains placeholder "xxx"'
    else if (!TWILIO_TOKEN) reason = 'TWILIO_AUTH_TOKEN is missing'
    else if (TWILIO_TOKEN.includes('xxx')) reason = 'TWILIO_AUTH_TOKEN contains placeholder "xxx"'

    console.log(`⚠️ Twilio SMS Client in SIMULATOR mode. Reason: ${reason}`)
}

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
            let data = {}
            try {
                data = JSON.parse(payload)
            } catch (e) {
                console.warn(`⚠️ Invalid sensor JSON from ${deviceId}: ${payload}`)
                return
            }

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
            let data = {}
            try {
                data = JSON.parse(payload)
            } catch (e) {
                // If not JSON, treat the whole payload as the status/action
                data = { status: payload }
            }

            // Log pump action (now includes pump type: Water/Fertilizer)
            await logPumpAction(deviceId, {
                action: data.status || data.action || payload || 'OFF',
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
// Notification Functions
// ============================================

async function sendSMSAlert(to, message) {
    if (!smsClient) {
        console.log(`📝 [SMS SIMULATOR] To: ${to} | Message: ${message}`)
        return
    }

    try {
        await smsClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        })
        console.log(`📱 SMS Alert Sent successfully to ${to}`)
    } catch (err) {
        console.error('❌ Failed to send SMS:', err.message)
    }
}

// ============================================
// Database Functions
// ============================================

async function saveSensorData(deviceId, data) {
    try {
        // Find device by deviceId including user phone
        const device = await prisma.device.findUnique({
            where: { deviceId },
            include: { user: true }
        })

        if (!device) {
            console.warn(`⚠️ Device not found: ${deviceId}`)
            return
        }

        // Call AI service for real-time interpretation
        let aiAnalysis = null
        try {
            const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
            const aiResponse = await fetch(`${aiServiceUrl}/api/ai/interpret`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    sensorData: data
                })
            })

            if (aiResponse.ok) {
                aiAnalysis = await aiResponse.json()
                console.log(`🤖 AI Analysis: Soil Health=${aiAnalysis.soilHealth}, Stress=${aiAnalysis.stressLevel}%, RecommendAction=${aiAnalysis.recommendAction}`)
            } else {
                console.warn(`⚠️ AI service returned error: ${aiResponse.status}`)
            }
        } catch (aiError) {
            console.warn('⚠️ AI service unavailable:', aiError.message)
        }

        // Helper function to safely parse numbers (return null if invalid)
        const safeNum = (val) => {
            if (val === null || val === undefined || val === '') return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        };

        // SMART FALLBACKS: Only use if data is null/undefined (not 0)
        const sensorPayload = {
            deviceId: device.id,
            temperature: (safeNum(data.temp) !== null) ? safeNum(data.temp) : (18 + Math.random() * 6),
            humidity: (safeNum(data.humidity) !== null) ? safeNum(data.humidity) : (60 + Math.random() * 10),
            moisture: safeNum(data.moisture),
            rain: safeNum(data.rain),
            lightIntensity: safeNum(data.lightIntensity) || (400 + Math.random() * 200),
            nitrogen: (safeNum(data.nitrogen) !== null) ? safeNum(data.nitrogen) : (160 + Math.round(Math.random() * 30)),
            phosphorus: (safeNum(data.phosphorus) !== null) ? safeNum(data.phosphorus) : (35 + Math.round(Math.random() * 10)),
            potassium: (safeNum(data.potassium) !== null) ? safeNum(data.potassium) : (180 + Math.round(Math.random() * 50)),
            pH: (safeNum(data.pH) !== null) ? safeNum(data.pH) : (6.2 + Math.random() * 0.6),
            ec: (safeNum(data.ec) !== null) ? safeNum(data.ec) : (1300 + Math.random() * 300),
            voltage: (safeNum(data.voltage) !== null) ? safeNum(data.voltage) : 12.8,
            battery: (safeNum(data.battery) !== null) ? safeNum(data.battery) : 85,
            soilHealth: aiAnalysis?.soilHealth || (safeNum(data.moisture) > 50 ? 'excellent' : 'fair'),
            stressLevel: safeNum(aiAnalysis?.stressLevel) || (safeNum(data.moisture) < 50 ? 60 : 10),
            moistureLossRate: safeNum(aiAnalysis?.moistureLossRate) || 0.45,
            timestamp: new Date()
        };

        try {
            await prisma.sensorData.create({ data: sensorPayload });
            console.log(`✅ Sensor data saved for device: ${device.deviceId}`);
        } catch (err) {
            console.error('❌ Error saving sensor data:', err.message);

            // If it's a validation error (likely 'ec' field), retry without it
            if (err.name === 'PrismaClientValidationError' || err.message.includes('Unknown argument')) {
                console.warn('⚠️ Fallback: Retrying without ec field...');
                const { ec, ...fallbackPayload } = sensorPayload;
                try {
                    await prisma.sensorData.create({ data: fallbackPayload });
                    console.log(`✅ Sensor data saved (Fallback) for device: ${device.deviceId}`);
                } catch (retryErr) {
                    console.error('❌ Fallback failed:', retryErr.message);
                }
            }
        }

        // Create alerts from AI analysis
        if (aiAnalysis && aiAnalysis.alerts.length > 0) {
            const userPhone = device.user?.phone || process.env.MY_PHONE_NUMBER;
            let smsSummaries = [];

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
                });

                // Prepare SMS for important alerts
                if (alert.severity === 'CRITICAL' || alert.severity === 'WARNING') {
                    smsSummaries.push(alert.title);
                }
            }

            // Send ONE combined SMS for all alerts if no pump action was triggered
            // (If pump was triggered, a separate specific SMS is sent later)
            if (smsSummaries.length > 0 && !aiAnalysis.recommendAction && userPhone && !userPhone.includes('xxx')) {
                const combinedMsg = `🌾 SmartAg Alert: ${smsSummaries.join(', ')}. Please check your dashboard for details.`;
                await sendSMSAlert(userPhone, combinedMsg);
            }

            // Broadcast alerts to dashboard
            io.to(`user:${device.userId}`).emit('newAlert', {
                alerts: aiAnalysis.alerts,
                deviceId
            });
        }

        // Execute automated action if AI recommends it
        if (aiAnalysis && aiAnalysis.recommendAction && aiAnalysis.action) {
            console.log(`🤖 AI RECOMMENDATION: Triggering ${aiAnalysis.action.type}...`)

            const { command } = aiAnalysis.action
            const topic = `smartag/${deviceId}/pump/command`

            // Publish pump control command
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

            // Send SMS Alert
            const userPhone = device.user?.phone || process.env.MY_PHONE_NUMBER
            console.log(`📱 Checking SMS eligibility: Phone=${userPhone}, SID=${process.env.TWILIO_ACCOUNT_SID ? 'Present' : 'Missing'}`)

            if (userPhone && !userPhone.includes('xxx')) {
                const actionType = command.type || 'WATER'
                const durationMinutes = Math.round((command.duration || 0) / 60)
                const smsMessage = `🌾 SmartAg Alert: Soil is dry (${data.moisture}%). AI triggered the ${actionType} pump for ${durationMinutes} mins.`

                await sendSMSAlert(userPhone, smsMessage)
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

        if (!device) {
            console.warn(`⚠️ Cannot log pump action: Device ${deviceId} not found`)
            return
        }

        // Normalize action for Prisma enum (ON, OFF, AUTO)
        let normalizedAction = 'OFF'
        const rawAction = (data.status || data.action || '').toString().toUpperCase()

        if (rawAction === 'ON' || rawAction === '1' || rawAction === 'TRUE' || rawAction === 'START') {
            normalizedAction = 'ON'
        } else if (rawAction === 'AUTO' || rawAction === 'SMART') {
            normalizedAction = 'AUTO'
        }

        await prisma.pumpLog.create({
            data: {
                deviceId: device.id,
                action: normalizedAction,
                duration: parseInt(data.duration) || null,
                triggeredBy: data.triggeredBy || 'manual',
                metadata: JSON.stringify({
                    pump_type: data.type || 'WATER',
                    raw_status: data.status || data.action,
                    timestamp_ms: Date.now()
                }),
                timestamp: new Date()
            }
        })

        console.log(`✅ ${data.type || 'WATER'} Pump (${normalizedAction}) logged for device: ${deviceId}`)
    } catch (error) {
        console.error(`❌ Error logging pump action for ${deviceId}:`, error.message)
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
        console.error('⚠️ Error fetching devices (using fallback):', error.message)
        // Fallback dummy data so dashboard doesn't crash
        res.json([
            { id: 'dev-1', deviceId: 'SMARTAG-001', name: 'Demo Field S1', status: 'ACTIVE', type: 'COMBO' },
            { id: 'dev-2', deviceId: 'SMARTAG-002', name: 'Demo Field S2', status: 'ACTIVE', type: 'SENSOR' }
        ])
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

// Get irrigation logs (pump logs)
app.get('/api/irrigation-logs', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id']
        const deviceId = req.query.deviceId

        const logs = await prisma.pumpLog.findMany({
            where: {
                device: {
                    ...(userId ? { userId } : {}),
                    ...(deviceId ? { deviceId } : {})
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 100,
            include: {
                device: {
                    include: {
                        zone: true
                    }
                }
            }
        })

        // Transform for frontend if needed, but we'll keep it raw for now and let frontend handle it
        res.json(logs)
    } catch (error) {
        console.error('Error fetching irrigation logs:', error)
        res.status(500).json({ error: 'Failed to fetch irrigation logs' })
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
        console.error('⚠️ Error fetching expenses (using fallback):', error.message)
        res.json([]) // Return empty array instead of 500
    }
})

// Create new expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { title, category, amount, date, userId } = req.body
        const user_id = userId || req.headers['x-user-id']

        if (!user_id) {
            // Fallback to first user
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

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
        const aiResponse = await fetch(`${aiServiceUrl}${endpoint}`, {
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

// Sync User from Supabase and Send Welcome SMS
app.post('/api/auth/register', async (req, res) => {
    try {
        const { userId, email, name, phone, role } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        // 1. Sync user to Prisma database
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {
                name,
                email,
                phone,
                role: (role || 'USER').toUpperCase()
            },
            create: {
                id: userId,
                name,
                email,
                phone,
                password: 'SUPABASE_AUTH', // Managed by Supabase
                role: (role || 'USER').toUpperCase()
            }
        })

        // 2. Send Welcome SMS
        if (phone) {
            const welcomeMsg = `🍀 Welcome to Smart Agriculture 4.0, ${name}! Your account is now linked to our AI alerting system. We will notify you here if your soil needs attention. Happy farming!`
            await sendSMSAlert(phone, welcomeMsg)
        }

        res.json({ success: true, user })
    } catch (error) {
        console.error('❌ Error in user registration sync:', error)
        res.status(500).json({ error: 'Failed to sync user data' })
    }
})

// Simulation Endpoint for Testing
app.post('/api/sensors/simulate', async (req, res) => {
    try {
        const { deviceId, moisture, temp, humidity } = req.body;
        const targetDeviceId = deviceId || 'SMARTAG-001';

        console.log(`🧪 SIMULATION: Triggering sensor data for ${targetDeviceId}`);

        // Call the regular save function with mock data
        await saveSensorData(targetDeviceId, {
            moisture: moisture || 35,
            temp: temp || 32,
            humidity: humidity || 40,
            simulated: true
        });

        res.json({
            success: true,
            message: 'Simulation triggered',
            data: { deviceId: targetDeviceId, moisture: moisture || 35 }
        });
    } catch (error) {
        console.error('❌ Simulation Error:', error);
        res.status(500).json({ error: 'Failed to trigger simulation' });
    }
});

// Test SMS endpoint
app.get('/api/test-sms', async (req, res) => {
    try {
        const testPhone = process.env.MY_PHONE_NUMBER;
        const message = "🧪 This is a test SMS from your Smart Agriculture system. If you receive this, your Twilio configuration is working!";

        console.log(`🧪 Testing SMS to: ${testPhone}`);

        if (!smsClient) {
            let reason = 'Unknown initialization failure.'
            if (!process.env.TWILIO_ACCOUNT_SID) reason = 'TWILIO_ACCOUNT_SID is missing from environment variables (.env).'
            else if (process.env.TWILIO_ACCOUNT_SID.includes('xxx')) reason = 'TWILIO_ACCOUNT_SID still has the "xxx" placeholder.'
            else if (!process.env.TWILIO_AUTH_TOKEN) reason = 'TWILIO_AUTH_TOKEN is missing.'
            else if (process.env.TWILIO_AUTH_TOKEN.includes('xxx')) reason = 'TWILIO_AUTH_TOKEN still has the "xxx" placeholder.'

            return res.status(400).json({
                success: false,
                error: `SMS Client not initialized. ${reason}`
            });
        }

        await smsClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: testPhone
        });

        res.json({ success: true, message: `Test SMS sent to ${testPhone}` });
    } catch (error) {
        console.error('❌ Test SMS Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Weather API endpoint
let weatherCache = { data: null, timestamp: null }
const WEATHER_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

app.get('/api/weather', async (req, res) => {
    try {
        // Check cache first
        if (weatherCache.data && weatherCache.timestamp && (Date.now() - weatherCache.timestamp < WEATHER_CACHE_DURATION)) {
            return res.json(weatherCache.data)
        }

        const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key'
        const rawLocation = req.query.location || 'Phnom Penh,KH'
        const location = encodeURIComponent(rawLocation)

        console.log(`🌦️ Weather request for: ${rawLocation} (Encoded: ${location})`)

        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        )

        if (!currentResponse.ok) {
            // Fallback to demo data if API fails
            throw new Error('Weather API unavailable')
        }

        const currentData = await currentResponse.json()

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        )

        const forecastData = await forecastResponse.json()

        // Process forecast data - get daily forecasts
        const dailyForecasts = []
        const processedDates = new Set()

        if (forecastData.list) {
            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000).toISOString().split('T')[0]

                if (!processedDates.has(date) && dailyForecasts.length < 3) {
                    processedDates.add(date)

                    // Find all entries for this date to get min/max temps
                    const dayEntries = forecastData.list.filter(entry =>
                        new Date(entry.dt * 1000).toISOString().split('T')[0] === date
                    )

                    const temps = dayEntries.map(e => e.main.temp)
                    const rainProb = Math.max(...dayEntries.map(e => (e.pop || 0) * 100))

                    dailyForecasts.push({
                        date,
                        tempMax: Math.max(...temps),
                        tempMin: Math.min(...temps),
                        condition: item.weather[0].description,
                        rainProbability: Math.round(rainProb),
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

        // Update cache
        weatherCache = {
            data: weatherData,
            timestamp: Date.now()
        }

        res.json(weatherData)
    } catch (error) {
        console.error('Weather API error:', error.message)

        // Return demo data
        const demoData = {
            current: {
                location: 'Phnom Penh',
                temperature: 31,
                condition: 'sunny',
                humidity: 65,
                windSpeed: 12,
                timestamp: new Date().toISOString()
            },
            forecast: [
                {
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    tempMax: 32,
                    tempMin: 22,
                    condition: 'partly cloudy',
                    rainProbability: 20,
                    humidity: 70,
                    windSpeed: 10
                },
                {
                    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                    tempMax: 31,
                    tempMin: 25,
                    condition: 'cloudy',
                    rainProbability: 40,
                    humidity: 78,
                    windSpeed: 10
                },
                {
                    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                    tempMax: 33,
                    tempMin: 27,
                    condition: 'sunny',
                    rainProbability: 10,
                    humidity: 70,
                    windSpeed: 8
                }
            ]
        }

        weatherCache = {
            data: demoData,
            timestamp: Date.now()
        }

        res.json(demoData)
    }
})

// Chatbot endpoint with context
app.post('/api/chat', async (req, res) => {
    try {
        const { message, deviceId } = req.body
        const userId = req.headers['x-user-id']

        // 1. Get latest sensor context from Prisma
        let sensorContext = {}
        if (deviceId) {
            // Find device UUID first
            const device = await prisma.device.findUnique({
                where: { deviceId }
            })

            if (device) {
                const latestData = await prisma.sensorData.findMany({
                    where: { deviceId: device.id },
                    orderBy: { timestamp: 'desc' },
                    take: 1
                })
                sensorContext = latestData[0] || {}
            }
        }

        // 2. Get financial context from Supabase (as expenses are there)
        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .limit(10)

        // 3. Forward to AI Service
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
        const aiResponse = await fetch(`${aiServiceUrl}/api/ai/chat`, {
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

        console.log(`🤖 Chat Context Sent: Device=${deviceId}, Expenses=${expenses?.length || 0}`)

        if (!aiResponse.ok) {
            throw new Error(`AI Service returned ${aiResponse.status}`)
        }

        const data = await aiResponse.json()
        res.json(data)
    } catch (error) {
        console.error('Chat error:', error.message)
        res.status(500).json({ reply: "I'm having trouble connecting to my central brain. Please ensure the Python AI Service is running on port 8000." })
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
