'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'
import { History } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl">
                <p className="text-xs font-bold text-foreground/40 mb-2 uppercase tracking-wider">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-sm font-bold text-foreground">{entry.name}: {entry.value}%</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const SensorHistoryChart = ({ data }) => {
    // If no data, show placeholder
    const chartData = data && data.length > 0 ? data : [
        { time: '00:00', moisture: 0, rain: 0 },
        { time: '00:00', moisture: 0, rain: 0 }
    ]

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl h-[400px] flex flex-col relative overflow-hidden group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20 shrink-0">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">Live Analytics</h3>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Real-time History</p>
                    </div>
                </div>

                {/* Legend Chips */}
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] md:text-xs font-bold text-green-600">Moisture</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] md:text-xs font-bold text-blue-600">Rain</span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-foreground/5" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600 }}
                            className="text-foreground/40"
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600 }}
                            className="text-foreground/40"
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="moisture"
                            name="Soil Moisture"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMoisture)"
                            animationDuration={1000}
                        />
                        <Area
                            type="monotone"
                            dataKey="rain"
                            name="Rain Level"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRain)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default SensorHistoryChart
