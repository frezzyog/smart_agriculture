'use client'

import React from 'react'
import { Activity, Thermometer, Droplets, FlaskConical, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SevenInOneSensorCard = ({ nitrogen, phosphorus, potassium, pH, ec, temp, humidity, status }) => {
    const { t } = useTranslation()

    // Status Logic Helpers (Converted from User's C++)
    const getPHStatus = (val) => {
        if (val < 5.5) return { label: 'ACIDIC (LOW)', color: 'text-red-500' }
        if (val <= 7.0) return { label: 'OPTIMAL', color: 'text-accent' }
        if (val <= 8.0) return { label: 'ALKALINE (HIGH)', color: 'text-yellow-500' }
        return { label: 'VERY HIGH', color: 'text-red-500' }
    }

    const getNStatus = (val) => {
        if (val < 40) return { label: 'VERY LOW', color: 'text-red-500' }
        if (val < 90) return { label: 'LOW', color: 'text-yellow-500' }
        if (val < 150) return { label: 'OPTIMAL', color: 'text-accent' }
        if (val < 220) return { label: 'HIGH', color: 'text-yellow-500' }
        return { label: 'EXCESS', color: 'text-red-500' }
    }

    const getPStatus = (val) => {
        if (val < 15) return { label: 'VERY LOW', color: 'text-red-500' }
        if (val < 35) return { label: 'LOW', color: 'text-yellow-500' }
        if (val < 70) return { label: 'OPTIMAL', color: 'text-accent' }
        if (val < 120) return { label: 'HIGH', color: 'text-yellow-500' }
        return { label: 'EXCESS', color: 'text-red-500' }
    }

    const getKStatus = (val) => {
        if (val < 80) return { label: 'VERY LOW', color: 'text-red-500' }
        if (val < 150) return { label: 'LOW', color: 'text-yellow-500' }
        if (val < 280) return { label: 'OPTIMAL', color: 'text-accent' }
        if (val < 400) return { label: 'HIGH', color: 'text-yellow-500' }
        return { label: 'EXCESS', color: 'text-red-500' }
    }

    const getECStatus = (val) => {
        if (val < 400) return { label: 'LOW', color: 'text-yellow-500' }
        if (val < 1200) return { label: 'OPTIMAL', color: 'text-accent' }
        if (val < 2000) return { label: 'HIGH', color: 'text-red-500' }
        return { label: 'EXCESS', color: 'text-red-500' }
    }

    // Prepare stats with status
    const stats = [
        { label: t('dashboard.nitrogen'), value: nitrogen, unit: 'mg/kg', icon: Activity, color: 'text-blue-500', status: getNStatus(Number(nitrogen)) },
        { label: t('dashboard.phosphorus'), value: phosphorus, unit: 'mg/kg', icon: Activity, color: 'text-orange-500', status: getPStatus(Number(phosphorus)) },
        { label: t('dashboard.potassium'), value: potassium, unit: 'mg/kg', icon: Activity, color: 'text-purple-500', status: getKStatus(Number(potassium)) },
        { label: t('dashboard.ph'), value: pH, unit: '', icon: FlaskConical, color: 'text-emerald-500', status: getPHStatus(Number(pH)) },
        { label: t('dashboard.ec'), value: ec, unit: 'µS/cm', icon: Zap, color: 'text-yellow-500', status: getECStatus(Number(ec)) }, // Changed mS/cm to µS/cm based on user ranges (400-2000 usually uS)
        { label: t('dashboard.temperature'), value: temp, unit: '°C', icon: Thermometer, color: 'text-red-500', status: null },
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-foreground/[0.03] rounded-2xl p-4 border border-white/5 flex flex-col justify-between group/item hover:bg-foreground/[0.05] transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={14} className={`${stat.color}`} />
                                <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-foreground">{stat.value}</span>
                                <span className="text-[10px] font-bold text-foreground/70">{stat.unit}</span>
                            </div>
                        </div>
                        {stat.status && (
                            <div className={`mt-3 text-[9px] font-black uppercase tracking-wider ${stat.status.color} py-1 px-2 rounded-lg bg-white/5 border border-white/5 self-start`}>
                                {stat.status.label}
                            </div>
                        )}
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
