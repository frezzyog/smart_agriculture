'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudDrizzle, CloudSnow } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CompactWeatherCard() {
    const { t } = useTranslation()
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWeather()
        const interval = setInterval(fetchWeather, 30 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchWeather = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            const response = await fetch(`${apiUrl}/api/weather`)
            const data = await response.json()
            setWeather(data.current)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching weather:', error)
            setLoading(false)
        }
    }

    const getWeatherIcon = (condition, size = 18) => {
        const lowerCondition = condition?.toLowerCase() || ''
        if (lowerCondition.includes('rain')) return <CloudRain size={size} className="text-sky-500" />
        if (lowerCondition.includes('cloud')) return <Cloud size={size} className="text-sky-400" strokeWidth={2.5} />
        if (lowerCondition.includes('drizzle')) return <CloudDrizzle size={size} className="text-sky-400" />
        if (lowerCondition.includes('snow')) return <CloudSnow size={size} className="text-foreground" />
        return <Sun size={size} className="text-orange-500" />
    }

    if (loading || !weather) {
        return (
            <div className="bg-white rounded-full h-[60px] w-[180px] animate-pulse border border-border/50"></div>
        )
    }

    return (
        <div className="bg-card rounded-full px-4 py-2 border border-border flex items-center gap-3 group cursor-default shadow-sm min-w-[160px] transition-colors">
            <div className="bg-sky-50 dark:bg-sky-500/10 p-2.5 rounded-2xl text-sky-500">
                {getWeatherIcon(weather.condition, 22)}
            </div>
            <div className="flex flex-col pr-2">
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-none mb-0.5">{t('dashboard_cards.weather')}</span>
                <span className="text-lg font-black text-foreground tracking-tighter leading-none">{Math.round(weather.temperature)}°C</span>
            </div>
        </div>
    )
}
