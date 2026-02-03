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
        if (lowerCondition.includes('cloud')) return <Cloud size={size} className="text-foreground/40" />
        if (lowerCondition.includes('drizzle')) return <CloudDrizzle size={size} className="text-sky-400" />
        if (lowerCondition.includes('snow')) return <CloudSnow size={size} className="text-foreground" />
        return <Sun size={size} className="text-orange-500" />
    }

    if (loading || !weather) {
        return (
            <div className="bg-card/50 rounded-2xl h-[70px] w-full animate-pulse border border-border/50"></div>
        )
    }

    return (
        <div className="bg-white hover:bg-white/80 transition-all duration-300 rounded-[1.25rem] px-5 py-3 border border-border flex items-center gap-4 group cursor-default shadow-sm hover:shadow-md">
            <div className="bg-sky-500/10 p-2 rounded-xl text-sky-500 group-hover:scale-110 transition-transform duration-500">
                {getWeatherIcon(weather.condition, 20)}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.1em] leading-none mb-1">{t('dashboard_cards.weather')}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-foreground tracking-tighter">{Math.round(weather.temperature)}°C</span>
                    <span className="text-[11px] font-bold text-foreground/40 capitalize border-l border-border pl-2 leading-none">{weather.condition}</span>
                </div>
            </div>
        </div>
    )
}
