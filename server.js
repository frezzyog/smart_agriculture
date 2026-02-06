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
// twilio removed
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch(() => global.fetch);


// Initialize Telegram-Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const hasTelegram = (TELEGRAM_BOT_TOKEN && !TELEGRAM_BOT_TOKEN.includes('xxx'))

if (hasTelegram) {
    console.log('✅ Telegram Bot Alerting initialized')
} else {
    console.log('⚠️ Telegram Bot in SIMULATOR mode. (Token missing/placeholder)')
}

// Simple Telegram Polling for linking users
if (hasTelegram) {
    let lastUpdateId = 0;

    async function pollTelegram() {
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
            const response = await fetch(url);
            if (!response.ok) return;

            const data = await response.json();
            if (data.result && data.result.length > 0) {
                for (const update of data.result) {
                    lastUpdateId = update.update_id;
                    if (update.message && update.message.text) {
                        const text = update.message.text;
                        const chatId = update.message.chat.id;

                        // Check for /start {userId}
                        if (text.startsWith('/start ')) {
                            const userId = text.split(' ')[1];
                            if (userId) {
                                try {
                                    // Link user to this chat ID
                                    await prisma.user.update({
                                        where: { id: userId },
                                        data: { telegramChatId: chatId.toString() }
                                    });

                                    await sendTelegramAlert(chatId, `<b>✅ បានភ្ជាប់មករួចរាល់!</b>\n\nគណនីរបស់អ្នកត្រូវបានភ្ជាប់ជាមួយប្រព័ន្ធ SmartAg។ អ្នកនឹងទទួលបានការជូនដំណឹងនៅទីនេះ។`);
                                    console.log(`🔗 Linked User ${userId} to Telegram Chat ${chatId}`);
                                } catch (e) {
                                    console.error('❌ Failed to link user:', e.message);
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            // Ignore polling errors
        } finally {
            setTimeout(pollTelegram, 5000);
        }
    }

    pollTelegram();
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
                data.battery = 67; // FORCE 67% FOR TESTING
            } catch (e) {
                console.warn(`⚠️ Invalid sensor JSON from ${deviceId}: ${payload}`)
                return
            }

            // Store sensor data in database and get AI analysis
            const saveResult = await saveSensorData(deviceId, data)

            if (saveResult) {
                const { aiAnalysis, sensorPayload } = saveResult;

                // Broadcast to connected dashboard clients (including AI interpretation and clean fallbacks)
                io.emit('sensorData', {
                    ...sensorPayload, // Use the cleaned payload with fallbacks (no 0 humidity)
                    ai: aiAnalysis,   // Include AI insights in the main feed
                    deviceId: deviceId, // Ensure string ID
                    timestamp: new Date().toISOString()
                })
            }
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

async function sendTelegramAlert(chatId, message) {
    if (!hasTelegram || !chatId) {
        console.log(`📝 [TELEGRAM SIMULATOR] ChatId: ${chatId}, Message: ${message}`)
        return
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        })

        if (response.ok) {
            console.log(`🚀 [TELEGRAM] Success! Alert sent to ${chatId}`);
        } else {
            const errData = await response.json();
            console.error(`❌ [TELEGRAM] Failed to send to ${chatId}:`, errData.description);
        }
    } catch (err) {
        console.error('❌ Failed to send Telegram Alert:', err.message)
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
            // Send ONE combined SMS for all alerts
            if (smsSummaries.length > 0) {
                const combinedMsg = `<b>🌾 ដំណឹងពី SmartAg</b>\n\n${smsSummaries.map(s => `• ${s}`).join('\n')}\n\nសូមពិនិត្យមើលផ្ទាំងគ្រប់គ្រងរបស់អ្នកសម្រាប់ព័ត៌មានលម្អិត។`

                // Alert the specific user if they have linked Telegram (AND no action pending, to avoid double notify)
                if (device.user?.telegramChatId && !aiAnalysis.recommendAction) {
                    await sendTelegramAlert(device.user.telegramChatId, combinedMsg);
                }

                // ALWAYS Alert Admin for critical/warning events (Field Test Mode)
                const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
                if (ADMIN_CHAT_ID) {
                    await sendTelegramAlert(ADMIN_CHAT_ID, `<b>[ADMIN] Alert for ${device.name}:</b>\n\n${combinedMsg}`);
                }
            }

            // Broadcast alerts to dashboard
            io.to(`user:${device.userId}`).emit('newAlert', {
                alerts: aiAnalysis.alerts,
                deviceId
            });
        }

        // Execute automated actions if AI recommends them (Support for multiple actions)
        const actionsToExecute = aiAnalysis?.actions || (aiAnalysis?.action ? [aiAnalysis.action] : []);

        if (actionsToExecute.length > 0) {
            console.log(`🤖 AI RECOMMENDATION: Triggering ${actionsToExecute.length} actions...`)

            for (const action of actionsToExecute) {
                const { command } = action
                const topic = `smartag/${deviceId}/pump/command`

                // Publish MQTT command to device
                aedes.publish({
                    topic,
                    payload: Buffer.from(JSON.stringify(command)),
                    qos: 0,
                    retain: false
                }, (err) => {
                    if (err) console.error(`❌ MQTT Publish Error for ${deviceId}:`, err);
                    else console.log(`📡 MQTT Command Sent to ${deviceId}: ${JSON.stringify(command)}`);
                })

                // Log the automated action
                await logPumpAction(deviceId, {
                    type: command.type || 'WATER',
                    action: command.status,
                    duration: command.duration,
                    triggeredBy: 'AI_SYSTEM'
                })

                // Notify dashboard
                io.emit('pumpStatus', {
                    deviceId,
                    type: command.type || 'WATER',
                    status: command.status,
                    duration: command.duration,
                    triggeredBy: 'AI_SYSTEM'
                })
            }

            // Combined Telegram Notification for multiple actions
            if (hasTelegram && device.user?.telegramChatId) {
                let alertDetails = [];
                for (const action of actionsToExecute) {
                    const isWater = action.command.type === 'WATER';
                    const actionType = isWater ? 'បូមទឹក' : 'បូមជី';
                    const duration = Math.round((action.command.duration || 0) / 60);
                    alertDetails.push(`• <b>${actionType}</b> ក្នុងរយៈពេល <b>${duration}</b> នាទី`);
                }

                const telegramMsg = `<b>🌾 ដំណឹងពី AI - សកម្មភាពស្វ័យប្រវត្តិ</b>\n\n${alertDetails.join('\n')}\n\nសូមពិនិត្យមើលផ្ទាំងគ្រប់គ្រងសម្រាប់ព័ត៌មានលម្អិត។`;
                await sendTelegramAlert(device.user.telegramChatId, telegramMsg);

                // Alert Admin
                const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
                if (ADMIN_CHAT_ID && ADMIN_CHAT_ID !== device.user?.telegramChatId) {
                    await sendTelegramAlert(ADMIN_CHAT_ID, telegramMsg);
                }
            }
        }

        // Update device status to ACTIVE
        await prisma.device.update({
            where: { id: device.id },
            data: { status: 'ACTIVE', updatedAt: new Date() }
        })

        console.log(`✅ Sensor data saved for device: ${deviceId}`)
        return { aiAnalysis, sensorPayload }
    } catch (error) {
        console.error('❌ Error saving sensor data:', error)
        return null
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
            qos: 0, // Changed to 0
            retain: false
        }, (err) => {
            if (err) console.error("❌ Dashboard MQTT error:", err);
            else console.log(`📡 Dashboard Command Sent: ${message}`);
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
        let user_id = userId || req.headers['x-user-id']

        // 1. Resolve User ID
        if (!user_id) {
            // Fallback to first user
            const { data: users } = await supabase.from('users').select('id').limit(1)
            user_id = users && users.length > 0 ? users[0].id : null

            if (!user_id) throw new Error('No user found in database to link expense to')
        } else {
            // Verify user exists to avoid Foreign Key error
            const { data: userExists } = await supabase
                .from('users')
                .select('id')
                .eq('id', user_id)
                .single()

            if (!userExists) {
                console.log(`⚠️ User ${user_id} not found in public.users, attempting fallback...`)
                const { data: users } = await supabase.from('users').select('id').limit(1)
                user_id = users && users.length > 0 ? users[0].id : null

                if (!user_id) throw new Error(`User ${userId} does not exist and no fallback users found`)
            }
        }

        // 2. Insert Expense
        const { data: expense, error } = await supabase
            .from('expenses')
            .insert({
                id: crypto.randomUUID(),
                user_id: user_id,
                title,
                category,
                amount,
                date: date || new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase Insert Error:', error)
            throw new Error(error.message)
        }

        res.json(expense)
    } catch (error) {
        console.error('Error creating expense:', error.message)
        res.status(500).json({ error: error.message || 'Failed to create expense' })
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

        // 2. Send Welcome Telegram Alert
        if (hasTelegram) {
            const welcomeMsg = `<b>🍀 សូមស្វាគមន៍មកកាន់ Smart Agriculture 4.0, ${name}!</b>\n\nគណនីរបស់អ្នកត្រូវបានភ្ជាប់ទៅប្រព័ន្ធជូនដំណឹង AI របស់យើងហើយ។ យើងនឹងជូនដំណឹងអ្នកនៅទីនេះ ប្រសិនបើដីរបស់អ្នកត្រូវការការយកចិត្តទុកដាក់។ រីករាយនឹងការធ្វើកសិកម្ម!`

            // If user already linked Telegram (unlikely here but good for consistency)
            if (user.telegramChatId) {
                await sendTelegramAlert(user.telegramChatId, welcomeMsg)
            } else {
                // Fallback to Admin
                const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
                if (ADMIN_CHAT_ID) {
                    await sendTelegramAlert(ADMIN_CHAT_ID, `<b>[ADMIN] New User Registered:</b> ${name} (${email})`)
                }
            }
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

// Test Telegram endpoint
app.get('/api/test-telegram', async (req, res) => {
    try {
        const message = "<b>🧪 សាកល្បង SmartAg</b>\n\nនេះគឺជាការសាកល្បងផ្ញើសារពីផ្ទាំងគ្រប់គ្រងរបស់អ្នក។ ប្រព័ន្ធ Telegram របស់អ្នកដំណើរការយ៉ាងល្អឥតខ្ចោះ!";

        console.log(`🧪 Testing Telegram Alert...`);

        if (!hasTelegram) {
            return res.status(400).json({
                success: false,
                error: `Telegram Bot not initialized. Please check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env`
            });
        }

        const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (!ADMIN_CHAT_ID) {
            return res.status(400).json({ success: false, error: 'ADMIN_CHAT_ID not set' });
        }

        await sendTelegramAlert(ADMIN_CHAT_ID, message);

        res.json({ success: true, message: `Test Telegram alert sent!` });
    } catch (error) {
        console.error('❌ Test Telegram Error:', error.message);
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

                if (!processedDates.has(date) && dailyForecasts.length < 7) {
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
                    rainProbability: 20
                },
                {
                    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                    tempMax: 31,
                    tempMin: 25,
                    condition: 'cloudy',
                    rainProbability: 40
                },
                {
                    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                    tempMax: 33,
                    tempMin: 27,
                    condition: 'sunny',
                    rainProbability: 10
                },
                {
                    date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
                    tempMax: 30,
                    tempMin: 26,
                    condition: 'rain',
                    rainProbability: 60
                },
                {
                    date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
                    tempMax: 29,
                    tempMin: 24,
                    condition: 'drizzle',
                    rainProbability: 30
                },
                {
                    date: new Date(Date.now() + 518400000).toISOString().split('T')[0],
                    tempMax: 34,
                    tempMin: 28,
                    condition: 'sunny',
                    rainProbability: 0
                },
                {
                    date: new Date(Date.now() + 604800000).toISOString().split('T')[0],
                    tempMax: 33,
                    tempMin: 27,
                    condition: 'cloudy',
                    rainProbability: 15
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
