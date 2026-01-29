// Socket.io hook for real-time updates
'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useRealtimeSensorData() {
    const [sensorData, setSensorData] = useState({
        moisture: 0,
        rain: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        pH: 7.0,
        ec: 0,
        temp: 0,
        humidity: 0,
        moistureRaw: 0,
        rainRaw: 0,
        deviceId: null,
        timestamp: null,
        connected: false
    })

    useEffect(() => {
        // Connect to Socket.io server (using 127.0.0.1 for stability)
        const socket = io('http://127.0.0.1:5000', {
            transports: ['websocket', 'polling']
        })

        socket.on('connect', () => {
            console.log('✅ Connected to Socket.io server')
            setSensorData(prev => ({ ...prev, connected: true }))
        })

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.io server')
            setSensorData(prev => ({ ...prev, connected: false }))
        })

        // Listen for sensor data updates
        socket.on('sensorData', (data) => {
            console.log('📊 Sensor data received:', data)
            setSensorData({
                moisture: data.moisture || 0,
                rain: data.rain || 0,
                nitrogen: data.nitrogen || 0,
                phosphorus: data.phosphorus || 0,
                potassium: data.potassium || 0,
                pH: data.pH || 7.0,
                ec: data.ec || 0,
                temp: data.temp || 0,
                humidity: data.humidity || 0,
                moistureRaw: data.moistureRaw || 0,
                rainRaw: data.rainRaw || 0,
                deviceId: data.deviceId,
                timestamp: data.timestamp,
                connected: true
            })
        })

        // Cleanup on unmount
        return () => {
            socket.disconnect()
        }
    }, [])

    return sensorData
}
