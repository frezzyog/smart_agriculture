'use client'

import React from 'react'
import { Activity, Thermometer, Droplets, FlaskConical, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SevenInOneSensorCard = ({ nitrogen, phosphorus, potassium, pH, ec, temp, humidity, status }) => {
    const { t } = useTranslation()

    const stats = [
        { label: t('dashboard.nitrogen'), value: nitrogen, unit: 'mg/kg', icon: Activity, color: 'text-blue-500' },
        { label: t('dashboard.phosphorus'), value: phosphorus, unit: 'mg/kg', icon: Activity, color: 'text-orange-500' },
        { label: t('dashboard.potassium'), value: potassium, unit: 'mg/kg', icon: Activity, color: 'text-purple-500' },
        { label: t('dashboard.ph'), value: pH, unit: '', icon: FlaskConical, color: 'text-emerald-500' },
        { label: t('dashboard.ec'), value: ec, unit: 'mS/cm', icon: Zap, color: 'text-yellow-500' },
        { label: t('dashboard.temperature'), value: temp, unit: '°C', icon: Thermometer, color: 'text-red-500' },
        { label: t('dashboard.humidity'), value: humidity, unit: '%', icon: Droplets, color: 'text-sky-500' },
    ]

    return (
        <div className="bg-card rounded-[2.5rem] p-6 md:p-8 border border-border flex flex-col h-full relative overflow-hidden group hover:border-accent/40 transition-all duration-500 shadow-xl shadow-black/20">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none">{t('dashboard.soil_7in1')}</h3>
                    <p className="text-foreground/40 text-xs md:text-sm font-medium mt-2">{t('dashboard.comprehensive_monitor')}</p>
                </div>
                <div className="text-accent flex items-center justify-center bg-accent/10 p-3 rounded-2xl border border-accent/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Activity size={24} strokeWidth={2.5} />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-foreground/[0.03] rounded-2xl p-4 border border-white/5 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon size={14} className={`${stat.color}`} />
                            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-foreground">{stat.value}</span>
                            <span className="text-[10px] font-bold text-foreground/70">{stat.unit}</span>
                        </div>
                    </div>
                ))}
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

export default SevenInOneSensorCard
