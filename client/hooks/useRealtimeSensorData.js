'use client'

import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useRealtimeSensorData() {
    const [sensorData, setSensorData] = React.useState({
        moisture: 0,
        rain: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        pH: 0.0,
        ec: 0,
        temp: 0,
        humidity: 0,
        moistureRaw: 0,
        rainRaw: 0,
        battery: 67, // Updated to 67 for testing as requested
        voltage: 11.9, // Adjusted to match 67% battery level
        deviceId: null,
        timestamp: null,
        connected: false
    })

    React.useEffect(() => {
        // Connect to Socket.io server
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5000'
        const socket = io(socketUrl, {
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
            setSensorData(prev => ({
                ...prev,
                moisture: data.moisture ?? prev.moisture,
                rain: data.rain ?? prev.rain,
                nitrogen: data.nitrogen ?? prev.nitrogen,
                phosphorus: data.phosphorus ?? prev.phosphorus,
                potassium: data.potassium ?? prev.potassium,
                pH: data.pH ?? prev.pH,
                ec: data.ec ?? prev.ec,
                temp: data.temp ?? prev.temp,
                humidity: data.humidity ?? prev.humidity,
                battery: data.battery ?? prev.battery,
                voltage: data.voltage ?? prev.voltage,
                deviceId: data.deviceId || prev.deviceId,
                timestamp: data.timestamp || new Date().toISOString(),
                connected: true
            }))
        })

        // Cleanup on unmount
        return () => {
            socket.disconnect()
        }
    }, [])

    return sensorData
}
