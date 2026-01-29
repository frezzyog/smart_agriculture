'use client'

import React from 'react'
import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PowerStatsCard = ({ percentage, voltage, charging, runtime }) => {
    const { t } = useTranslation()
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-border flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">{t('dashboard.power_stats')}</h3>
                    <p className="text-foreground/50 text-sm font-medium mt-1">Array B - Lithium Unit</p>
                </div>
                <div className="text-yellow-400 flex items-center justify-center bg-yellow-400/10 p-2.5 rounded-xl border border-yellow-400/20">
                    <Zap size={22} fill="currentColor" />
                </div>
            </div>

            <div className="flex-1 flex flex-col xs:flex-row items-center justify-center gap-6 xs:gap-8 mb-6">
                <div className="relative w-28 h-28 xs:w-32 xs:h-32">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="56"
                            cy="56"
                            r={38}
                            fill="transparent"
                            stroke="currentColor"
                            className="text-foreground/5"
                            strokeWidth="8"
                        />
                        <circle
                            cx="56"
                            cy="56"
                            r={38}
                            fill="transparent"
                            stroke="#15ff71"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={(2 * Math.PI * 38) - (percentage / 100) * (2 * Math.PI * 38)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl xs:text-3xl font-black text-foreground">{percentage}%</span>
                    </div>
                </div>

                <div className="space-y-2 xs:space-y-4 text-center xs:text-left">
                    <div>
                        <div className="text-2xl xs:text-3xl font-black text-foreground tracking-tighter">
                            {voltage} <span className="text-base xs:text-lg text-foreground/50 font-bold uppercase ml-1">Volts</span>
                        </div>
                        {charging && (
                            <div className="flex items-center justify-center xs:justify-start gap-1.5 text-[9px] xs:text-[10px] font-bold text-accent uppercase tracking-widest mt-1">
                                <Zap size={10} fill="currentColor" />
                                {t('dashboard.charging')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{t('dashboard.runtime')}</span>
                <span className="text-xs font-bold text-foreground tracking-tight">{runtime}</span>
            </div>
        </div>
    )
}

export default PowerStatsCard
