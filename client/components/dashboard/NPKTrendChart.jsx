'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()

    const translatedData = [
        { name: t('npk_chart.mon'), n: 40, p: 24, k: 30 },
        { name: t('npk_chart.tue'), n: 38, p: 28, k: 45 },
        { name: t('npk_chart.wed'), n: 45, p: 22, k: 35 },
        { name: t('npk_chart.thu'), n: 50, p: 32, k: 55 },
        { name: t('npk_chart.fri'), n: 48, p: 35, k: 60 },
        { name: t('npk_chart.sat'), n: 42, p: 30, k: 50 },
        { name: t('npk_chart.sun'), n: 40, p: 28, k: 45 },
    ]
    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-border h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">{t('npk_chart.title')}</h3>
                    <p className="text-foreground/50 text-sm font-medium mt-1">{t('npk_chart.subtitle')}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff6b6b]"></div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('npk_chart.nitrogen')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#15ff71]"></div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('npk_chart.phosphorus')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00d2ff]"></div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('npk_chart.potassium')}</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={translatedData}>
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
