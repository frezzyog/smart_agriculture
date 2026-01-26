import { useQuery } from '@tanstack/react-query'
import api, { getAIPredictions, getAlerts, getZones, getDigitalTwin } from '@/lib/api'

export function useAIInsights(zoneId = 'main-zone') {
    // Fetch predictions
    const predictions = useQuery({
        queryKey: ['ai-predictions', zoneId],
        queryFn: () => getAIPredictions(zoneId),
        enabled: !!zoneId,
        refetchInterval: 5000
    })

    // Fetch alerts
    const alerts = useQuery({
        queryKey: ['ai-alerts'],
        queryFn: () => getAlerts(),
        refetchInterval: 5000
    })

    // Fetch zones
    const zones = useQuery({
        queryKey: ['zones'],
        queryFn: () => getZones(),
        refetchInterval: 60000 // Zones don't change often
    })

    // Fetch digital twin
    const digitalTwin = useQuery({
        queryKey: ['digital-twin', zoneId],
        queryFn: () => getDigitalTwin(zoneId),
        enabled: !!zoneId,
        refetchInterval: 5000
    })

    return {
        predictions: { ...predictions, data: predictions.data || [] },
        alerts: { ...alerts, data: alerts.data || [] },
        zones: { ...zones, data: zones.data || [] },
        digitalTwin: { ...digitalTwin, data: digitalTwin.data || null },
        isLoading: (predictions.isLoading || alerts.isLoading || zones.isLoading || digitalTwin.isLoading) && !predictions.error && !alerts.error && !zones.error && !digitalTwin.error,
        error: predictions.error || alerts.error || zones.error || digitalTwin.error
    }
}
