'use client'

import React from 'react'
import { Zap, Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CompactPowerCard = ({ percentage, voltage, charging }) => {
    const { t } = useTranslation()

    const getBatteryIcon = (pct, size = 56) => {
        if (charging) return <Zap size={size} className="text-yellow-400" fill="currentColor" />
        if (pct > 75) return <BatteryFull size={size} className="text-emerald-400" />
        if (pct > 40) return <BatteryMedium size={size} className="text-yellow-400" />
        return <BatteryLow size={size} className="text-red-400" />
    }

    return (
        <div className="bg-black rounded-[2rem] p-6 h-[180px] flex flex-col justify-between border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Main Power Info */}
            <div className="flex items-start gap-6 relative z-10">
                <div className="p-1">
                    {getBatteryIcon(percentage, 56)}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-white tracking-tighter">{percentage}</span>
                        <span className="text-2xl font-bold text-white/40">%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm font-bold text-white/60 tracking-tight">
                            {voltage}V
                        </div>
                        {charging && (
                            <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-yellow-400/20">
                                {t('dashboard.charging')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Power Grid Layout Icons (Symmetrical to Weather) */}
            <div className="flex justify-between items-end px-1 relative z-10">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                            SYS {i}
                        </span>
                        <div className={`h-1 w-6 rounded-full ${percentage > (i * 20) ? (charging ? 'bg-yellow-400' : 'bg-emerald-400') : 'bg-white/10'}`}></div>
                    </div>
                ))}
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-[60px]"></div>
        </div>
    )
}

export default CompactPowerCard
