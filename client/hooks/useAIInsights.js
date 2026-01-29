import { useQuery } from '@tanstack/react-query'
import api, { getAIPredictions, getAlerts, getZones, getDigitalTwin, getDevices, getSensorData } from '@/lib/api'

export function useAIInsights(zoneId = 'main-zone') {
    // Fetch predictions
    const predictions = useQuery({
        queryKey: ['ai-predictions', zoneId],
        queryFn: () => getAIPredictions(zoneId),
        enabled: !!zoneId,
        refetchInterval: 5000,
        retry: 2,
        staleTime: 3000
    })

    // Fetch alerts
    const alerts = useQuery({
        queryKey: ['ai-alerts'],
        queryFn: () => getAlerts(),
        refetchInterval: 5000,
        retry: 2,
        staleTime: 3000
    })

    // Fetch zones
    const zones = useQuery({
        queryKey: ['zones'],
        queryFn: () => getZones(),
        refetchInterval: 60000, // Zones don't change often
        retry: 2,
        staleTime: 30000
    })

    // Fetch digital twin
    const digitalTwin = useQuery({
        queryKey: ['digital-twin', zoneId],
        queryFn: () => getDigitalTwin(zoneId),
        enabled: !!zoneId,
        refetchInterval: 5000,
        retry: 2,
        staleTime: 3000
    })

    // Fetch latest sensor data (for AI stats) - this is the critical one
    const latestSensor = useQuery({
        queryKey: ['latest-sensor', zoneId],
        queryFn: async () => {
            const devices = await getDevices()
            if (devices && devices.length > 0) {
                const device = devices[0]
                const id = device.deviceId || device.device_id || device.id
                const data = await getSensorData(id, { limit: 1 })
                return data && data.length > 0 ? data[0] : null
            }
            return null
        },
        refetchInterval: 5000,
        retry: 3,
        staleTime: 2000
    })

    // Only block on latestSensor loading - other queries can show partial data
    const isCriticalLoading = latestSensor.isLoading && !latestSensor.data

    return {
        predictions: { ...predictions, data: predictions.data || [] },
        alerts: { ...alerts, data: alerts.data || [] },
        zones: { ...zones, data: zones.data || [] },
        digitalTwin: { ...digitalTwin, data: digitalTwin.data || null },
        latestSensor: { ...latestSensor, data: latestSensor.data || null },
        isLoading: isCriticalLoading,
        error: predictions.error || alerts.error || zones.error || digitalTwin.error || latestSensor.error
    }
}

