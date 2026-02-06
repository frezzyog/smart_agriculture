'use client'

import React from 'react'
import { Activity, Zap, TrendingUp, AlertCircle, CheckCircle2, FlaskConical, Thermometer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FertilizerMonitor = ({ nitrogen, phosphorus, potassium, ec, ph, temp }) => {
    const { t } = useTranslation()

    // Status Helpers
    const getStatusStyle = (val, max, low, high) => {
        if (val < low) return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'LOW' }
        if (val > high) return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'HIGH' }
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'OPTIMAL' }
    }

    const getNStatus = (val) => {
        if (val < 40) return { label: 'LOW', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
        if (val < 90) return { label: 'MODERATE', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-transparent' }
        if (val < 150) return { label: 'OPTIMAL', color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-transparent' }
        return { label: 'EXCESS', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
    }

    const getPStatus = (val) => {
        if (val < 15) return { label: 'LOW', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
        if (val < 35) return { label: 'MODERATE', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-transparent' }
        if (val < 70) return { label: 'OPTIMAL', color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-transparent' }
        return { label: 'EXCESS', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
    }

    const getKStatus = (val) => {
        if (val < 80) return { label: 'LOW', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
        if (val < 150) return { label: 'MODERATE', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-transparent' }
        if (val < 280) return { label: 'OPTIMAL', color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-transparent' }
        return { label: 'EXCESS', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
    }

    const getECStatus = (val) => {
        if (val < 400) return { label: 'LOW ACTIVITY', color: 'text-yellow-500' }
        if (val < 1200) return { label: 'OPTIMAL', color: 'text-emerald-500' }
        return { label: 'HIGH ALKALINITY', color: 'text-red-500' }
    }

    const getPHStatus = (val) => {
        if (val < 5.5) return { label: 'ACIDIC', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
        if (val <= 7.0) return { label: 'OPTIMAL', color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-transparent' }
        if (val <= 8.0) return { label: 'ALKALINE', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-transparent' }
        return { label: 'VERY HIGH', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
    }

    const getTempStatus = (val) => {
        if (val < 15) return { label: 'COLD', color: 'text-blue-500', gradient: 'from-blue-500/20 to-transparent' }
        if (val > 35) return { label: 'HOT', color: 'text-red-500', gradient: 'from-red-500/20 to-transparent' }
        return { label: 'OPTIMAL', color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-transparent' }
    }

    const nStatus = getNStatus(Number(nitrogen));
    const pStatus = getPStatus(Number(phosphorus));
    const kStatus = getKStatus(Number(potassium));
    const ecStatus = getECStatus(Number(ec));
    const phStatus = getPHStatus(Number(ph));
    const tempStatus = getTempStatus(Number(temp));

    return (
        <div className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header / EC Main Display */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 relative z-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Zap className="text-yellow-400 fill-yellow-400/20" size={32} />
                        {t('dashboard.soil_integrated_sensor')}
                    </h2>
                    <p className="text-foreground/40 mt-2 font-medium">Real-time Nutrient Analysis & Conductivity</p>
                </div>

                <div className="flex items-center gap-6 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold mb-1">Electrical Conductivity</div>
                        <div className={`text-4xl font-black ${ecStatus.color} tabular-nums tracking-tight`}>
                            {ec} <span className="text-lg text-foreground/40">µS/cm</span>
                        </div>
                    </div>
                    <div className={`h-12 w-1 rounded-full ${ecStatus.color.replace('text-', 'bg-')}/50`}></div>
                    <div className="text-left">
                        <div className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold mb-1">Status</div>
                        <div className={`text-sm font-bold ${ecStatus.color} flex items-center gap-2`}>
                            {ecStatus.label}
                        </div>
                    </div>
                </div>
            </div>

            {/* The 5 Big Boxes for N, P, K, pH, Temp */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {/* Nitrogen Box */}
                <div className="group relative bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2rem] p-6 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent rounded-[2rem] transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-8 relative">
                        <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-500">
                            <Activity size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${nStatus.color} border-current bg-transparent`}>
                            {nStatus.label}
                        </div>
                    </div>

                    <div className="relative">
                        <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">{t('dashboard.nitrogen') || 'Nitrogen'} (N)</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground tracking-tight group-hover:text-blue-400 transition-colors duration-300">{nitrogen}</span>
                            <span className="text-sm font-bold text-foreground/30">mg/kg</span>
                        </div>

                        {/* Progress Bar Visual */}
                        <div className="mt-6 h-2 w-full bg-blue-950/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min((nitrogen / 250) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Phosphorus Box */}
                <div className="group relative bg-gradient-to-br from-orange-500/5 to-transparent rounded-[2rem] p-6 border border-orange-500/10 hover:border-orange-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent rounded-[2rem] transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-8 relative">
                        <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-400 group-hover:scale-110 transition-transform duration-500">
                            <Activity size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${pStatus.color} border-current bg-transparent`}>
                            {pStatus.label}
                        </div>
                    </div>

                    <div className="relative">
                        <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">{t('dashboard.phosphorus') || 'Phosphorus'} (P)</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground tracking-tight group-hover:text-orange-400 transition-colors duration-300">{phosphorus}</span>
                            <span className="text-sm font-bold text-foreground/30">mg/kg</span>
                        </div>

                        <div className="mt-6 h-2 w-full bg-orange-950/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min((phosphorus / 150) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Potassium Box */}
                <div className="group relative bg-gradient-to-br from-purple-500/5 to-transparent rounded-[2rem] p-6 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent rounded-[2rem] transition-all duration-500"></div>


                    <div className="flex justify-between items-start mb-8 relative">
                        <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform duration-500">
                            <Activity size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${kStatus.color} border-current bg-transparent`}>
                            {kStatus.label}
                        </div>
                    </div>

                    <div className="relative">
                        <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">{t('dashboard.potassium') || 'Potassium'} (K)</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground tracking-tight group-hover:text-purple-400 transition-colors duration-300">{potassium}</span>
                            <span className="text-sm font-bold text-foreground/30">mg/kg</span>
                        </div>

                        <div className="mt-6 h-2 w-full bg-purple-950/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min((potassium / 400) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* pH Box */}
                <div className="group relative bg-gradient-to-br from-emerald-500/5 to-transparent rounded-[2rem] p-6 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent rounded-[2rem] transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-8 relative">
                        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                            <FlaskConical size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${phStatus.color} border-current bg-transparent`}>
                            {phStatus.label}
                        </div>
                    </div>

                    <div className="relative">
                        <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">{t('dashboard.ph') || 'pH Level'}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground tracking-tight group-hover:text-emerald-400 transition-colors duration-300">{ph}</span>
                            <span className="text-sm font-bold text-foreground/30">pH</span>
                        </div>

                        <div className="mt-6 h-2 w-full bg-emerald-950/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min((ph / 14) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Temperature Box */}
                <div className="group relative bg-gradient-to-br from-red-500/5 to-transparent rounded-[2rem] p-6 border border-red-500/10 hover:border-red-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent rounded-[2rem] transition-all duration-500"></div>

                    <div className="flex justify-between items-start mb-8 relative">
                        <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 group-hover:scale-110 transition-transform duration-500">
                            <Thermometer size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tempStatus.color} border-current bg-transparent`}>
                            {tempStatus.label}
                        </div>
                    </div>

                    <div className="relative">
                        <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">{t('dashboard.temperature') || 'Temperature'}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground tracking-tight group-hover:text-red-500 transition-colors duration-300">{temp}</span>
                            <span className="text-sm font-bold text-foreground/30">°C</span>
                        </div>

                        <div className="mt-6 h-2 w-full bg-red-950/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min((temp / 50) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FertilizerMonitor
