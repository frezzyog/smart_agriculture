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
            const response = await fetch('http://localhost:5000/api/weather')
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
        <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/10 dark:from-sky-600/20 dark:to-blue-700/20 p-6 rounded-2xl border border-sky-200/50 dark:border-sky-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Weather Forecast</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{weather.location}</p>
                </div>
                <div className="p-3 bg-sky-500/20 dark:bg-sky-600/30 rounded-xl">
                    <WeatherIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
            </div>

            {/* Current Weather */}
            <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{Math.round(weather.temperature)}°</span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 mb-2">C</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{weather.condition}</p>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{weather.humidity}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Wind</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{weather.windSpeed} km/h</p>
                    </div>
                </div>
            </div>

            {/* Rain Prediction Alert */}
            {rainPrediction && rainPrediction.willRain && (
                <div className="bg-blue-500/20 dark:bg-blue-600/30 border border-blue-400/50 dark:border-blue-500/50 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Rain Expected Tomorrow</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                {rainPrediction.probability}% chance - AI will skip irrigation
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3-Day Forecast */}
            {forecast.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Next 3 Days</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {forecast.slice(0, 3).map((day, index) => {
                            const DayIcon = getWeatherIcon(day.condition)
                            return (
                                <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        {index === 0 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                    <DayIcon className="w-5 h-5 mx-auto mb-2 text-sky-600 dark:text-sky-400" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{Math.round(day.tempMax)}°</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{Math.round(day.tempMin)}°</p>
                                    {day.rainProbability > 30 && (
                                        <div className="mt-1 flex items-center justify-center gap-1">
                                            <CloudRain className="w-3 h-3 text-blue-500" />
                                            <span className="text-xs text-blue-600 dark:text-blue-400">{day.rainProbability}%</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
