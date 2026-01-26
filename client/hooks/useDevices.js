import { useState, useEffect } from 'react'
import { getDevices } from '@/lib/api'

export const useDevices = () => {
    const [devices, setDevices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const data = await getDevices()
                setDevices(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchDevices()
    }, [])

    return { devices, loading, error }
}
