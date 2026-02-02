'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'

const SensorCard = ({ title, subtitle, moisture, ec, pH, status, icon: Icon }) => {
    const { t } = useTranslation()

    return (
        <div className="bg-card rounded-[2.5rem] p-6 md:p-8 border border-border flex flex-col h-full relative overflow-hidden group hover:border-accent/40 transition-all duration-500 shadow-xl shadow-black/20">
            {/* Background Accent Blur */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none">{title}</h3>
                    <p className="text-foreground/40 text-xs md:text-sm font-medium mt-2">{subtitle}</p>
                </div>
                <div className="text-accent flex items-center justify-center bg-accent/10 p-3 rounded-2xl border border-accent/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>

            <div className="flex-1 space-y-8 relative z-10">
                {/* Hero Number - Moisture */}
                <div className="bg-foreground/[0.03] rounded-3xl p-5 border border-white/5 shadow-inner">
                    <div className="flex items-end justify-between mb-1">
                        <span className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">{t('dashboard.moisture')}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-black text-accent tracking-tighter drop-shadow-sm">{moisture}</span>
                        <span className="text-xl font-bold text-accent/60">%</span>
                    </div>
                </div>

                {/* Secondary Numbers */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] block mb-2">{t('dashboard.ec')} <span className="text-[8px] opacity-60">(mS)</span></span>
                        <span className="text-3xl font-black text-foreground tracking-tighter">{ec}</span>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] block mb-2">{t('dashboard.ph')}</span>
                        <span className="text-3xl font-black text-foreground tracking-tighter">{pH}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status?.includes('Live') || status?.includes('ផ្ទាល់') ? 'bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'bg-yellow-500'}`}></div>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{status}</span>
                </div>
                <div className="bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/10">
                    <span className="text-[10px] font-black text-accent uppercase tracking-tighter">{t('dashboard_cards.live_feed')}</span>
                </div>
            </div>
        </div>
    )
}

export default SensorCard
