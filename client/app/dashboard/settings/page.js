'use client'

import React, { useState } from 'react'
import {
    RefreshCw,
    Sprout,
    Zap,
    Bell,
    Check,
    Save
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
    const { t } = useTranslation()
    const [autoPowerSaving, setAutoPowerSaving] = useState(true)

    const notificationMatrix = [
        { trigger: t('settings_page.triggers.battery'), push: true, telegram: true, email: false },
        { trigger: t('settings_page.triggers.moisture'), push: true, telegram: false, email: true },
        { trigger: t('settings_page.triggers.ec'), push: true, telegram: false, email: false },
        { trigger: t('settings_page.triggers.maintenance'), push: false, telegram: false, email: false },
    ]

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background text-white pb-40 transition-all duration-500">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">{t('settings_page.title')}</h1>
                        <p className="text-gray-400 font-medium max-w-2xl text-base md:text-lg leading-relaxed">
                            {t('settings_page.description')}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 w-full md:w-auto">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 whitespace-nowrap">{t('settings_page.last_synced')}</span>
                        <div className="flex items-center gap-2 text-accent">
                            <RefreshCw size={14} className="animate-spin-slow" />
                            <span className="text-xs font-black whitespace-nowrap">{t('settings_page.minutes_ago', { count: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Soil Health Thresholds */}
                    <div className="bg-card rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                                    <Sprout size={24} />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight">{t('settings_page.soil_health_thresholds')}</h2>
                            </div>
                            <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">
                                {t('settings_page.automated_monitoring')}
                            </span>
                        </div>

                        <div className="space-y-12">
                            {/* Moisture Range */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
                                <div className="md:col-span-3">
                                    <h3 className="text-base md:text-lg font-bold mb-1">{t('settings_page.moisture_range')}</h3>
                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{t('settings_page.moisture_range_desc')}</p>
                                </div>
                                <div className="md:col-span-7 px-4 py-4 md:py-0">
                                    <div className="relative h-2 bg-white/5 rounded-full">
                                        <div className="absolute left-[30%] right-[20%] h-full bg-accent rounded-full shadow-[0_0_15px_rgba(21,255,113,0.3)]"></div>
                                        <div className="absolute left-[30%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-accent border-4 border-background shadow-[0_0_15px_rgba(21,255,113,0.5)] cursor-pointer"></div>
                                            <span className="text-[9px] md:text-[10px] font-black text-accent mt-3">30%</span>
                                        </div>
                                        <div className="absolute left-[80%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-accent border-4 border-background shadow-[0_0_15px_rgba(21,255,113,0.5)] cursor-pointer"></div>
                                            <span className="text-[9px] md:text-[10px] font-black text-accent mt-3">80%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex gap-4">
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 md:py-4 text-center text-xs md:text-sm font-black">30</div>
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 md:py-4 text-center text-xs md:text-sm font-black">80</div>
                                </div>
                            </div>

                            {/* EC (mS/cm) */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
                                <div className="md:col-span-3">
                                    <h3 className="text-base md:text-lg font-bold mb-1">{t('settings_page.ec_range')}</h3>
                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{t('settings_page.ec_range_desc')}</p>
                                </div>
                                <div className="md:col-span-7 px-4 py-4 md:py-0">
                                    <div className="relative h-2 bg-white/5 rounded-full">
                                        <div className="absolute left-[40%] right-[30%] h-full bg-accent rounded-full shadow-[0_0_15px_rgba(21,255,113,0.3)]"></div>
                                        <div className="absolute left-[40%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-accent border-4 border-background shadow-[0_0_15px_rgba(21,255,113,0.5)] cursor-pointer"></div>
                                            <span className="text-[9px] md:text-[10px] font-black text-accent mt-3">1.2</span>
                                        </div>
                                        <div className="absolute left-[70%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-accent border-4 border-background shadow-[0_0_15px_rgba(21,255,113,0.5)] cursor-pointer"></div>
                                            <span className="text-[9px] md:text-[10px] font-black text-accent mt-3">2.5</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex gap-4">
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 md:py-4 text-center text-xs md:text-sm font-black">1.2</div>
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 md:py-4 text-center text-xs md:text-sm font-black">2.5</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Power Management */}
                    <div className="bg-card rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                                <Zap size={24} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">{t('settings_page.power_management')}</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                            <div className="lg:col-span-8 flex flex-col">
                                <div className="flex justify-between items-end mb-6">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">{t('settings_page.critical_battery')}</h3>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('settings_page.critical_battery_desc')}</p>
                                    </div>
                                    <span className="text-4xl font-black text-accent">20%</span>
                                </div>
                                <div className="relative h-2 bg-white/5 rounded-full mt-2">
                                    <div className="absolute left-0 w-[20%] h-full bg-accent rounded-full shadow-[0_0_15px_rgba(21,255,113,0.3)]"></div>
                                    <div className="absolute left-[20%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-accent border-4 border-background shadow-[0_0_15px_rgba(21,255,113,0.5)] cursor-pointer"></div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex justify-end">
                                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex items-center justify-between gap-10 w-full lg:w-auto">
                                    <div>
                                        <div className="text-xs font-black text-white uppercase tracking-wider mb-1">{t('settings_page.auto_power_saving')}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('settings_page.optimization_enabled')}</div>
                                    </div>
                                    <button
                                        onClick={() => setAutoPowerSaving(!autoPowerSaving)}
                                        className={`w-16 h-9 rounded-full p-1.5 transition-all duration-300 ${autoPowerSaving ? 'bg-accent shadow-[0_0_20px_rgba(21,255,113,0.3)]' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-xl transform transition-transform duration-300 ${autoPowerSaving ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Matrix */}
                    <div className="bg-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="p-10 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                                    <Bell size={24} />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">{t('settings_page.notification_matrix')}</h2>
                            </div>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr>
                                        <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('settings_page.alert_trigger')}</th>
                                        <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('settings_page.push_app')}</th>
                                        <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('settings_page.telegram')}</th>
                                        <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('settings_page.email')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {notificationMatrix.map((item, i) => (
                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-10 font-bold text-xl text-gray-300 group-hover:text-white transition-colors">{item.trigger}</td>
                                            <td className="p-10">
                                                <div className="flex justify-center">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${item.push ? 'bg-accent border-accent text-background shadow-[0_0_15px_rgba(21,255,113,0.3)]' : 'border-white/10'}`}>
                                                        {item.push && <Check size={16} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex justify-center">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${item.telegram ? 'bg-accent border-accent text-background shadow-[0_0_15px_rgba(21,255,113,0.3)]' : 'border-white/10'}`}>
                                                        {item.telegram && <Check size={16} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex justify-center">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${item.email ? 'bg-accent border-accent text-background shadow-[0_0_15px_rgba(21,255,113,0.3)]' : 'border-white/10'}`}>
                                                        {item.email && <Check size={16} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 sm:bottom-10 left-0 lg:left-64 right-0 p-4 sm:px-10 z-50">
                <div className="bg-card/80 backdrop-blur-2xl border border-border rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1200px] mx-auto">
                    <div className="hidden md:flex items-center gap-4 px-6">
                        <div className="text-gray-400 text-xs font-bold italic opacity-60">
                            {t('settings_page.settings_broadcast', { count: 12 })}
                        </div>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-6 sm:px-12 py-4 sm:py-5 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all">
                            {t('settings_page.discard')}
                        </button>
                        <button className="flex-1 sm:flex-none px-6 sm:px-12 py-4 sm:py-5 bg-accent text-[#020603] hover:scale-[1.05] active:scale-[0.95] rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(21,255,113,0.3)] transition-all flex items-center justify-center gap-3">
                            <Save size={18} />
                            {t('settings_page.save_all')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
