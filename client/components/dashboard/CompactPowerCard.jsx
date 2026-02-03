'use client'

import React from 'react'
import { Zap, Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CompactPowerCard = ({ percentage, voltage, charging }) => {
    const { t } = useTranslation()

    const getBatteryIcon = (pct, size = 20) => {
        if (charging) return <Zap size={size} strokeWidth={2.5} className="text-yellow-500" fill="currentColor" />
        if (pct > 75) return <BatteryFull size={size} strokeWidth={2.5} className="text-emerald-500" />
        if (pct > 40) return <BatteryMedium size={size} strokeWidth={2.5} className="text-yellow-500" />
        return <BatteryLow size={size} strokeWidth={2.5} className="text-red-500" />
    }

    const getColorClass = (pct) => {
        if (charging) return 'text-yellow-500'
        if (pct > 75) return 'text-emerald-500'
        if (pct > 40) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getBgColorClass = (pct) => {
        if (charging) return 'bg-yellow-500'
        if (pct > 75) return 'bg-emerald-500'
        if (pct > 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="bg-card rounded-[2.5rem] p-6 border border-border flex flex-col relative overflow-hidden group hover:border-yellow-500/40 transition-all duration-500 shadow-xl shadow-black/20">
            {/* Background Accent Blur */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-[40px] group-hover:bg-yellow-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-none">{t('dashboard.power_stats')}</h3>
                    <p className="text-foreground/40 text-[10px] font-medium mt-1.5 uppercase tracking-wider">{charging ? t('dashboard.charging') : 'Battery System'}</p>
                </div>
                <div className={`${getColorClass(percentage)} flex items-center justify-center bg-foreground/[0.03] p-2.5 rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    {getBatteryIcon(percentage, 20)}
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                <div className="bg-foreground/[0.03] rounded-3xl p-4 border border-white/5 shadow-inner">
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${getColorClass(percentage)} tracking-tighter`}>{percentage}</span>
                        <span className={`text-lg font-bold ${getColorClass(percentage)} opacity-40`}>%</span>
                    </div>
                    <div className="text-[10px] font-bold text-foreground/30 mt-1">{voltage}V Output</div>
                </div>

                {/* Status Bar Grid */}
                <div className="flex justify-between items-end gap-1 px-1 pt-2 border-t border-border/50">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[7px] font-black text-foreground/20 uppercase tracking-tighter">
                                L{i}
                            </span>
                            <div className={`h-1.5 w-full rounded-full transition-all duration-1000 ${percentage >= (i * 20) ? getBgColorClass(percentage) : 'bg-foreground/5'}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CompactPowerCard
