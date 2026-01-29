'use client'

import { useState, useEffect } from 'react'
import socket from '@/lib/socket'

export const useSensorData = (deviceId) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        if (!deviceId) return

        socket.on(`sensor-data:${deviceId}`, (newData) => {
            setData(newData)
        })

        return () => {
            socket.off(`sensor-data:${deviceId}`)
        }
    }, [deviceId])

    return data
}
