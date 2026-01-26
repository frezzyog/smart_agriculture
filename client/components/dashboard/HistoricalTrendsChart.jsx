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
            <div className="bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl text-white">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">{payload[0].value}%</span>
                    <span className="text-xs font-medium text-gray-400">Avg. Moisture</span>
                </div>
            </div>
        )
    }
    return null
}

const HistoricalTrendsChart = () => {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 h-[350px] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Weekly Efficiency</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Soil Moisture Trends</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">High: 72%</span>
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">Low: 45%</span>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }}
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
