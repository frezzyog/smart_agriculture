'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data = [
    { zone: 'Zone A', moisture: 32, humidity: 45 },
    { zone: 'Zone B', moisture: 58, humidity: 60 },
    { zone: 'Zone C', moisture: 45, humidity: 55 },
    { zone: 'Zone D', moisture: 78, humidity: 65 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl text-white">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                        <span className="text-sm font-bold">{entry.name}: {entry.value}%</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const ZoneComparisonChart = () => {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 h-[350px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Zone Comparison</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Moisture & Humidity Levels</p>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="zone"
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
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                        <Bar dataKey="moisture" name="Soil Moisture" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="humidity" name="Humidity" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default ZoneComparisonChart
