'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
    { name: 'MON', n: 40, p: 24, k: 30 },
    { name: 'TUE', n: 38, p: 28, k: 45 },
    { name: 'WED', n: 45, p: 22, k: 35 },
    { name: 'THU', n: 50, p: 32, k: 55 },
    { name: 'FRI', n: 48, p: 35, k: 60 },
    { name: 'SAT', n: 42, p: 30, k: 50 },
    { name: 'SUN', n: 40, p: 28, k: 45 },
]

const NPKTrendChart = () => {
    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-border h-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">NPK Levels (7-Day Trend)</h3>
                    <p className="text-foreground/50 text-sm font-medium mt-1">Measured in mg/kg Soil Mass</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff6b6b]"></div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Nitrogen (N)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#15ff71]"></div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Phosphorus (P)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00d2ff]"></div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Potassium (K)</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-foreground/5" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                            className="text-foreground/40"
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="n"
                            stroke="#ff6b6b"
                            strokeWidth={4}
                            dot={false}
                            animationDuration={2000}
                        />
                        <Line
                            type="monotone"
                            dataKey="p"
                            stroke="#15ff71"
                            strokeWidth={4}
                            dot={false}
                            animationDuration={2000}
                        />
                        <Line
                            type="monotone"
                            dataKey="k"
                            stroke="#00d2ff"
                            strokeWidth={4}
                            dot={false}
                            animationDuration={2000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default NPKTrendChart
