'use client'

import React from 'react'
import { Zap, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CompactPowerCard = ({ percentage, voltage, charging }) => {
    const { t } = useTranslation()

    const getBatteryIcon = (pct, size = 20) => {
        if (charging) return <Zap size={size} className="text-yellow-500" fill="currentColor" />
        if (pct > 75) return <BatteryFull size={size} className="text-emerald-500" />
        if (pct > 40) return <BatteryMedium size={size} className="text-yellow-500" />
        return <BatteryLow size={size} className="text-red-500" />
    }

    return (
        <div className="bg-white hover:bg-white/80 transition-all duration-300 rounded-[1.25rem] px-5 py-3 border border-border flex items-center gap-4 group cursor-default shadow-sm hover:shadow-md">
            <div className="bg-yellow-500/10 p-2 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform duration-500">
                {getBatteryIcon(percentage, 20)}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.1em] leading-none mb-1">{t('dashboard.power_stats')}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-foreground tracking-tighter">{percentage}%</span>
                    <span className="text-[11px] font-bold text-foreground/40 border-l border-border pl-2 leading-none">{voltage}V</span>
                </div>
            </div>
        </div>
    )
}

export default CompactPowerCard
