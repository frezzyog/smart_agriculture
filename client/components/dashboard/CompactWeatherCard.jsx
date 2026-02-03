'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudSnow, CloudDrizzle, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CompactWeatherCard() {
    const { t, i18n } = useTranslation()
    const [weather, setWeather] = useState(null)
    const [forecast, setForecast] = useState([])
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
            setForecast(data.forecast || [])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching weather:', error)
            setLoading(false)
        }
    }

    const getWeatherIcon = (condition, size = 24) => {
        const lowerCondition = condition?.toLowerCase() || ''
        if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return <CloudRain size={size} className="text-sky-400" />
        if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return <Cloud size={size} className="text-gray-400" />
        if (lowerCondition.includes('drizzle')) return <CloudDrizzle size={size} className="text-sky-300" />
        if (lowerCondition.includes('snow')) return <CloudSnow size={size} className="text-white" />
        return <Sun size={size} className="text-orange-400" />
    }

    if (loading || !weather) {
        return (
            <div className="bg-black rounded-[2rem] p-6 h-[180px] animate-pulse flex items-center justify-center border border-white/5">
                <div className="text-white/20 font-bold uppercase tracking-widest text-xs">Loading Forecast...</div>
            </div>
        )
    }

    return (
        <div className="bg-black rounded-[2rem] p-6 h-[180px] flex flex-col justify-between border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Main Weather Info */}
            <div className="flex items-start gap-6 relative z-10">
                <div className="p-1">
                    {getWeatherIcon(weather.condition, 56)}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-white tracking-tighter">{Math.round(weather.temperature)}°</span>
                        <span className="text-2xl font-bold text-white/40">C</span>
                    </div>
                    <div className="text-sm font-bold text-white/60 mt-1 capitalize tracking-tight">
                        {weather.condition}
                    </div>
                </div>
            </div>

            {/* 5-Day Mini Forecast */}
            <div className="flex justify-between items-end px-1 relative z-10">
                {forecast.slice(0, 5).map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                            {index === 0 ? 'TOD' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                        </span>
                        <div className="opacity-80">
                            {getWeatherIcon(day.condition, 16)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/5 rounded-full blur-[60px]"></div>
        </div>
    )
}
