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
        return <BatteryLow size={size} className="text-red-500" strokeWidth={2.5} />
    }

    const getBatteryBg = (pct) => {
        if (charging) return 'bg-yellow-50 dark:bg-yellow-500/10'
        if (pct > 75) return 'bg-emerald-50 dark:bg-emerald-500/10'
        if (pct > 40) return 'bg-yellow-50 dark:bg-yellow-500/10'
        return 'bg-orange-50 dark:bg-orange-500/10'
    }

    return (
        <div className="bg-card rounded-full px-4 py-2 border border-border flex items-center gap-3 group cursor-default shadow-sm min-w-[160px] transition-colors">
            <div className={`${getBatteryBg(percentage)} p-2.5 rounded-2xl`}>
                {getBatteryIcon(percentage, 22)}
            </div>
            <div className="flex flex-col pr-2">
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-none mb-0.5">{t('dashboard.power_stats')}</span>
                <span className="text-lg font-black text-foreground tracking-tighter leading-none">{percentage}%</span>
            </div>
        </div>
    )
}

export default CompactPowerCard
