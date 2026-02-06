'use client'

import React from 'react'
import { Droplet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SoilSensorCard = ({ moisture, status }) => {
    const { t } = useTranslation()
    const moistureNum = Number(moisture)
    const isCritical = moistureNum < 50
    const isWarning = moistureNum >= 50 && moistureNum < 60

    let colorClass, bgColorClass, borderColorClass, shadowColorClass, glowColorClass
    if (isCritical) {
        colorClass = 'text-red-500'
        bgColorClass = 'bg-red-500/10'
        borderColorClass = 'border-red-500/50'
        shadowColorClass = 'shadow-red-500/10'
        glowColorClass = 'bg-red-500/20'
    } else if (isWarning) {
        colorClass = 'text-yellow-500'
        bgColorClass = 'bg-yellow-500/10'
        borderColorClass = 'border-yellow-500/50'
        shadowColorClass = 'shadow-yellow-500/10'
        glowColorClass = 'bg-yellow-500/20'
    } else {
        colorClass = 'text-emerald-500'
        bgColorClass = 'bg-emerald-500/10'
        borderColorClass = 'hover:border-emerald-500/40 border-border'
        shadowColorClass = ''
        glowColorClass = 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
    }

    // Status Logic Helpers (Converted from User's C++)
    const getMoistureStatus = (m) => {
        if (m < 50) return { label: 'VERY DRY', color: 'text-red-500' }
        if (m < 60) return { label: 'DRY', color: 'text-yellow-500' }
        if (m <= 80) return { label: 'OPTIMAL', color: 'text-emerald-500' }
        if (m <= 90) return { label: 'WET', color: 'text-blue-500' }
        return { label: 'WATERLOGGED', color: 'text-red-500' }
    }

    const moistureStatus = getMoistureStatus(moistureNum)

    return (
        <div className={`bg-card rounded-[2.5rem] p-6 md:p-8 border transition-all duration-500 shadow-xl shadow-black/20 relative overflow-hidden group ${isCritical || isWarning ? borderColorClass + ' ' + shadowColorClass : borderColorClass}`}>
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] transition-all duration-700 ${glowColorClass}`}></div>

            <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none">{t('dashboard.soil_moisture')}</h3>
                    <p className="text-foreground/40 text-xs md:text-sm font-medium mt-2">{t('dashboard.moisture_level')}</p>
                </div>
                <div className={`flex items-center justify-center p-3 rounded-2xl border shadow-inner group-hover:scale-110 transition-transform duration-500 ${colorClass} ${bgColorClass} ${isCritical || isWarning ? borderColorClass.replace('hover:', '') : 'border-' + colorClass.replace('text-', '') + '/20'}`}>
                    <Droplet size={24} strokeWidth={2.5} />
                </div>
            </div>

            <div className="flex-1 space-y-8 relative z-10">
                <div className="bg-foreground/[0.03] rounded-3xl p-5 border border-white/5 shadow-inner">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl md:text-5xl font-black tracking-tighter drop-shadow-sm ${colorClass}`}>
                                {moisture}
                            </span>
                            <span className={`text-xl font-bold ${colorClass.replace('text-', 'text-')}/60`}>%</span>
                        </div>
                        <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${moistureStatus.color} py-1.5 px-3 rounded-xl bg-white/5 border border-white/5`}>
                            {moistureStatus.label}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status?.includes('Live') || status?.includes('ផ្ទាល់') ? 'bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-yellow-500'}`}></div>
                    <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">{status}</span>
                </div>
            </div>
        </div>
    )
}

export default SoilSensorCard
