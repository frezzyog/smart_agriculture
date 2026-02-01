'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudSnow, CloudDrizzle } from 'lucide-react'

export default function WeatherCard() {
    const [weather, setWeather] = useState(null)
    const [forecast, setForecast] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWeather()
        const interval = setInterval(fetchWeather, 30 * 60 * 1000) // Refresh every 30 minutes
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

    const getWeatherIcon = (condition) => {
        const lowerCondition = condition?.toLowerCase() || ''
        if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return CloudRain
        if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return Cloud
        if (lowerCondition.includes('drizzle')) return CloudDrizzle
        if (lowerCondition.includes('snow')) return CloudSnow
        return Sun
    }

    const getRainPrediction = () => {
        const tomorrow = forecast[0]
        if (!tomorrow) return null

        const willRain = tomorrow.rainProbability > 50 || tomorrow.condition?.toLowerCase().includes('rain')
        return {
            willRain,
            probability: tomorrow.rainProbability,
            date: tomorrow.date
        }
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/10 dark:from-sky-600/20 dark:to-blue-700/20 p-6 rounded-2xl border border-sky-200/50 dark:border-sky-700/50 shadow-lg animate-pulse">
                <div className="h-32 bg-sky-300/20 dark:bg-sky-700/20 rounded"></div>
            </div>
        )
    }

    if (!weather) {
        return (
            <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/10 dark:from-sky-600/20 dark:to-blue-700/20 p-6 rounded-2xl border border-sky-200/50 dark:border-sky-700/50 shadow-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Weather data unavailable</p>
            </div>
        )
    }

    const WeatherIcon = getWeatherIcon(weather.condition)
    const rainPrediction = getRainPrediction()

    return (
        <div className="bg-card rounded-[2.5rem] p-6 md:p-8 border border-border flex flex-col h-full relative overflow-hidden group hover:border-sky-500/40 transition-all duration-500 shadow-xl shadow-black/20">
            {/* Background Gradient Orbs for Glassmorphism */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-[60px] group-hover:bg-sky-500/20 transition-all duration-700"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10 gap-2">
                <div className="flex gap-3 items-center">
                    <div className="p-2.5 bg-sky-500/10 rounded-2xl border border-sky-500/20 shadow-inner group-hover:scale-111 transition-transform duration-500">
                        <WeatherIcon className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground tracking-tight leading-none">Weather</h3>
                        <p className="text-foreground/40 text-[9px] uppercase font-black tracking-widest mt-1.5">{weather.location}</p>
                    </div>
                </div>
                <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                    <div className="text-2xl font-black text-foreground whitespace-nowrap">{Math.round(weather.temperature)}°C</div>
                    <div className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter">{weather.condition}</div>
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                {/* Compact Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/5">
                        <Droplets className="w-3 h-3 text-sky-500" />
                        <span className="text-sm font-black text-foreground">{weather.humidity}%</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/5">
                        <Wind className="w-3 h-3 text-sky-500" />
                        <span className="text-sm font-black text-foreground">{weather.windSpeed}k/h</span>
                    </div>
                </div>

                {/* Simplified Forecast List (Horizontal) */}
                <div className="bg-foreground/[0.03] rounded-3xl p-4 border border-white/5">
                    <div className="flex justify-between gap-1 overflow-x-auto pb-1 scrollbar-hide">
                        {forecast.slice(0, 3).map((day, index) => {
                            const DayIcon = getWeatherIcon(day.condition)
                            return (
                                <div key={index} className="flex flex-col items-center min-w-[50px]">
                                    <span className="text-[9px] font-bold text-foreground/30 uppercase mb-1">
                                        {index === 0 ? 'Tmr' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <DayIcon className="w-4 h-4 text-sky-500/60 mb-1" />
                                    <span className="text-xs font-black text-foreground">{Math.round(day.tempMax)}°</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Rain Probability Badge if relevant */}
                {rainPrediction && rainPrediction.willRain && (
                    <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3 flex items-center gap-3">
                        <CloudRain className="w-4 h-4 text-sky-500 animate-bounce" />
                        <span className="text-[10px] font-bold text-sky-500 uppercase tracking-tight">Rain Tmr: {rainPrediction.probability}% (AI Adjusting)</span>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-center relative z-10">
                <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Smart Weather Intelligence</span>
            </div>
        </div>
    )
}
