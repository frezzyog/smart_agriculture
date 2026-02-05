'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudDrizzle, CloudSnow } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CompactWeatherCard() {
    const { t } = useTranslation()
    const [weather, setWeather] = useState(null)
    const [forecastData, setForecastData] = useState([])
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
            if (data.forecast) {
                setForecastData(formatForecast(data.forecast))
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching weather:', error)
            setLoading(false)
        }
    }

    const formatForecast = (dailyData) => {
        return dailyData.map(d => {
            const date = new Date(d.date)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
            return {
                day: dayName,
                temp: Math.round(d.tempMax),
                condition: d.condition
            }
        })
    }

    const getDayLabel = (dayKey) => t(`days.${dayKey}`)

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
            <div className="bg-white rounded-2xl h-[60px] w-full animate-pulse border border-border/50"></div>
        )
    }

    return (
        <div className="bg-card/50 backdrop-blur-md rounded-2xl p-2 border border-white/5 flex items-center gap-4 overflow-x-auto scrollbar-hide shadow-inner max-w-full">
            {/* Current Weather (Left Highlight) */}
            <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-xl border border-border shadow-sm min-w-[140px]">
                <div className="bg-sky-50 dark:bg-sky-500/10 p-2.5 rounded-2xl text-sky-500">
                    {getWeatherIcon(weather.condition, 24)}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none mb-1">{t('dashboard_cards.weather')}</span>
                    <span className="text-xl font-black text-foreground tracking-tighter leading-none">{Math.round(weather.temperature)}°C</span>
                </div>
            </div>

            {/* Forecast Data */}
            <div className="flex items-center gap-3 pr-2">
                {forecastData.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[50px]">
                        <span className="text-[10px] font-bold text-foreground/40 uppercase">{getDayLabel(day.day)}</span>
                        {getWeatherIcon(day.condition, 16)}
                        <span className="text-xs font-bold text-foreground">{day.temp}°</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
