'use client'

import React from 'react'
import { Droplet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SoilSensorCard = ({ moisture, status }) => {
    const { t } = useTranslation()

    return (
        <div className="bg-card rounded-[2.5rem] p-6 md:p-8 border border-border flex flex-col h-full relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 shadow-xl shadow-black/20">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none">{t('dashboard.soil_moisture')}</h3>
                    <p className="text-foreground/40 text-xs md:text-sm font-medium mt-2">{t('dashboard.moisture_level')}</p>
                </div>
                <div className="text-emerald-500 flex items-center justify-center bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Droplet size={24} strokeWidth={2.5} />
                </div>
            </div>

            <div className="flex-1 space-y-8 relative z-10">
                <div className="bg-foreground/[0.03] rounded-3xl p-5 border border-white/5 shadow-inner">
                    <div className="flex items-end justify-between mb-1">
                        <span className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">{t('dashboard.moisture_percentage')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-black text-emerald-500 tracking-tighter drop-shadow-sm">{moisture}</span>
                        <span className="text-xl font-bold text-emerald-500/60">%</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status?.includes('Live') || status?.includes('ផ្ទាល់') ? 'bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-yellow-500'}`}></div>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{status}</span>
                </div>
            </div>
        </div>
    )
}

export default SoilSensorCard
