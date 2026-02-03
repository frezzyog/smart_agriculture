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
        if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return <CloudRain size={size} strokeWidth={2.5} className="text-sky-500" />
        if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return <Cloud size={size} strokeWidth={2.5} className="text-foreground/60" />
        if (lowerCondition.includes('drizzle')) return <CloudDrizzle size={size} strokeWidth={2.5} className="text-sky-400" />
        if (lowerCondition.includes('snow')) return <CloudSnow size={size} strokeWidth={2.5} className="text-foreground" />
        return <Sun size={size} strokeWidth={2.5} className="text-orange-500" />
    }

    if (loading || !weather) {
        return (
            <div className="bg-card rounded-[2.5rem] p-6 border border-border animate-pulse flex items-center justify-center">
                <div className="text-foreground/20 font-bold uppercase tracking-widest text-xs">Loading...</div>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-[2.5rem] p-6 border border-border flex flex-col relative overflow-hidden group hover:border-sky-500/40 transition-all duration-500 shadow-xl shadow-black/20">
            {/* Background Accent Blur */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 rounded-full blur-[40px] group-hover:bg-sky-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-none">{t('dashboard_cards.weather')}</h3>
                    <p className="text-foreground/40 text-[10px] font-medium mt-1.5 uppercase tracking-wider">{weather.condition}</p>
                </div>
                <div className="text-sky-500 flex items-center justify-center bg-sky-500/10 p-2.5 rounded-2xl border border-sky-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {getWeatherIcon(weather.condition, 20)}
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                <div className="bg-foreground/[0.03] rounded-3xl p-4 border border-white/5 shadow-inner">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-foreground tracking-tighter">{Math.round(weather.temperature)}</span>
                        <span className="text-lg font-bold text-foreground/40">°C</span>
                    </div>
                </div>

                {/* Mini Forecast Row */}
                <div className="grid grid-cols-5 gap-1 pt-2 border-t border-border/50">
                    {forecast.slice(0, 5).map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black text-foreground/30 uppercase">
                                {index === 0 ? 'TOD' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                            </span>
                            <div className="opacity-70 scale-75">
                                {getWeatherIcon(day.condition, 14)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
