'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Clock } from 'lucide-react'

const data = [
    { time: '12 PM', level: 45, predicted: 45 },
    { time: '4 PM', level: 42, predicted: 42 },
    { time: '8 PM', level: 38, predicted: 38 },
    { time: '12 AM', level: null, predicted: 35 },
    { time: '4 AM', level: null, predicted: 30 },
    { time: '8 AM', level: null, predicted: 25 },
    { time: '12 PM', level: null, predicted: 40 },
]

const PredictiveChart = () => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Predictive Soil Moisture</h3>
                    <p className="text-xs text-gray-500 mt-1">24-hour AI-driven hydration forecast</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <Clock size={14} /> Next update in 12m
                </div>
            </div>

            <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="level"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorLevel)"
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="predicted"
                            stroke="#3b82f6"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPredicted)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Prediction</span>
                    </div>
                </div>
                <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
                    <p className="text-[10px] font-bold text-blue-700">Next Irrigation Hint: 04:00 AM</p>
                </div>
            </div>
        </div>
    )
}

export default PredictiveChart
