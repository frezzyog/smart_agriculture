'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
    { day: 'Mon', avg: 45 },
    { day: 'Tue', avg: 52 },
    { day: 'Wed', avg: 48 },
    { day: 'Thu', avg: 61 },
    { day: 'Fri', avg: 55 },
    { day: 'Sat', avg: 67 },
    { day: 'Sun', avg: 72 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl">
                <p className="text-xs font-bold text-foreground/40 mb-2 uppercase tracking-wider">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-foreground">{payload[0].value}%</span>
                    <span className="text-xs font-medium text-foreground/40">Avg. Moisture</span>
                </div>
            </div>
        )
    }
    return null
}

const HistoricalTrendsChart = () => {
    return (
        <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-xl h-[350px] flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">Weekly Efficiency</h3>
                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Soil Moisture Trends</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-lg">High: 72%</span>
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-lg">Low: 45%</span>
                </div>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-foreground/5" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 700 }}
                            className="text-foreground/40"
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 700 }}
                            className="text-foreground/40"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="avg"
                            stroke="#8b5cf6"
                            strokeWidth={4}
                            fill="url(#colorAvg)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default HistoricalTrendsChart
