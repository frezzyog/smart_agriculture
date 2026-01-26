import axios from 'axios'
import { simulateAIPredictions, simulateAlerts, simulateZones } from './aiSimulator.js'

const USE_SIMULATOR = false // 🔁 SWITCH THIS ON/OFF

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
})

export const getDevices = async () => {
    const response = await api.get('/devices')
    return response.data
}

export const getSensorData = async (deviceId) => {
    const response = await api.get(`/sensors/${deviceId}`)
    return response.data
}

export const controlPump = async (deviceId, status) => {
    const response = await api.post(`/devices/${deviceId}/pump`, { status })
    return response.data
}

// AI API Calls
export const getAlerts = async (params = {}) => {
    if (USE_SIMULATOR) return simulateAlerts()
    const response = await api.get('/alerts', { params })
    return response.data
}

export const markAlertAsRead = async (alertId) => {
    const response = await api.patch(`/alerts/${alertId}/read`)
    return response.data
}

export const getAIPredictions = async (zoneId, params = {}) => {
    if (USE_SIMULATOR) return simulateAIPredictions(zoneId)
    const response = await api.get(`/ai/predictions/${zoneId}`, { params })
    return response.data
}

export const generateAIPrediction = async (data) => {
    const response = await api.post('/ai/predictions/generate', data)
    return response.data
}

export const getZones = async () => {
    if (USE_SIMULATOR) return simulateZones()
    const response = await api.get('/zones')
    return response.data
}

export const createZone = async (data) => {
    const response = await api.post('/zones/create', data)
    return response.data
}

export const getDigitalTwin = async (zoneId) => {
    if (USE_SIMULATOR) return {
        health: 'optimal',
        efficiency: 0.94,
        lastUpdated: new Date().toISOString(),
        layout: [
            { x: 30, y: 40, type: 'CROP', health: 92 },
            { x: 70, y: 30, type: 'CROP', health: 88 },
            { x: 50, y: 60, type: 'SENSOR', health: 100 },
            { x: 20, y: 80, type: 'DRY_ZONE', health: 45 },
            { x: 80, y: 70, type: 'CROP', health: 95 }
        ]
    }
    const response = await api.get(`/ai/digital-twin/${zoneId}`)
    return response.data
}

export default api
