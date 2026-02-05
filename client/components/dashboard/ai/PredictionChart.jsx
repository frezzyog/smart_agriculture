'use client'

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { useTranslation } from 'react-i18next'

const data = [
    { day: 'Mon', current: 65, predicted: 65 },
    { day: 'Tue', current: 58, predicted: 58 },
    { day: 'Wed', current: 52, predicted: 52 },
    { day: 'Thu', current: null, predicted: 45 },
    { day: 'Fri', current: null, predicted: 38 },
    { day: 'Sat', current: null, predicted: 32 },
    { day: 'Sun', current: null, predicted: 25 },
]

const CustomTooltip = ({ active, payload, label }) => {
    const { t } = useTranslation()
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border p-4 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-foreground/40 text-[10px] font-bold uppercase mb-2">{label} {t('status.forecast')}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <p className="text-sm font-bold text-foreground">
                            {entry.name}: <span className="text-accent">{entry.value}%</span>
                        </p>
                    </div>
                ))}
                {payload[0].value > 70 && ( // Logic changed: High value means high moisture
                    <p className="text-accent text-[9px] font-bold mt-2 animate-pulse uppercase">
                        💧 {t('status.wet')}
                    </p>
                )}
                {payload[0].value < 30 && (
                    <p className="text-red-500 text-[9px] font-bold mt-2 animate-pulse uppercase">
                        ⚠️ {t('status.irrigation_required')}
                    </p>
                )}
            </div>
        )
    }
    return null
}

const PredictionChart = ({ zoneId, data: chartData }) => {
    const { t } = useTranslation()
    // Fallback data if none provided
    const displayData = chartData?.length > 0 ? chartData : [
        { day: t('days.mon'), predicted: 68 },
        { day: t('days.tue'), predicted: 62 },
        { day: t('days.wed'), predicted: 55 },
        { day: t('days.thu'), predicted: 48 },
        { day: t('days.fri'), predicted: 75 }, // Rain/Irrigation event
        { day: t('days.sat'), predicted: 72 },
        { day: t('days.sun'), predicted: 68 },
    ]

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={displayData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15ff71" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#15ff71" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-foreground/5" />
                <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                    className="text-foreground/40"
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                    className="text-foreground/40"
                    domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    name={t('ai_insights_page.ai_predicted')}
                    type="monotone"
                    dataKey="predicted"
                    stroke="#15ff71"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    dot={{ r: 4, fill: '#15ff71', strokeWidth: 2, stroke: 'var(--card)' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default PredictionChart
