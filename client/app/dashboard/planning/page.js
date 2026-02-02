'use client'

import React from 'react'
import { Calendar, Plus, Clock, MapPin, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PlanningPage() {
    const { t } = useTranslation()
    const events = [
        { id: 1, title: t('planning_page.tasks.nutrient'), time: '08:00 AM', location: 'Zone A', status: 'completed', type: 'System' },
        { id: 2, title: t('planning_page.tasks.ph_test'), time: '11:30 AM', location: 'Zone B', status: 'upcoming', type: 'Manual' },
        { id: 3, title: t('planning_page.tasks.harvest'), time: '02:00 PM', location: 'Zone C', status: 'pending', type: 'Team' },
        { id: 4, title: t('planning_page.tasks.irrigation'), time: '06:00 PM', location: 'All Zones', status: 'upcoming', type: 'System' },
    ]

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background text-foreground transition-all duration-500">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-2 flex items-center gap-3">
                            {t('planning_page.title')} <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">{t('planning_page.subtitle')}</span>
                        </h1>
                        <p className="text-sm md:text-base text-foreground/50 font-medium">{t('planning_page.description')}</p>
                    </div>
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                        <Plus size={18} />
                        {t('planning_page.create_task')}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Calendar Sidebar (Mock) */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border">
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <h3 className="text-lg md:text-xl font-bold text-foreground">January 2026</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors">{'<'}</button>
                                    <button className="p-2 bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors">{'>'}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <span key={`${d}-${i}`} className="text-[10px] font-black text-foreground/20 text-center uppercase">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 md:gap-2">
                                {Array.from({ length: 31 }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`h-8 md:h-10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all ${i + 1 === 26 ? 'bg-accent text-background' : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-accent rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-background">
                            <h4 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2">
                                <AlertCircle size={20} />
                                {t('planning_page.weather_alert')}
                            </h4>
                            <p className="text-xs md:text-sm font-bold opacity-70 mb-6">{t('planning_page.weather_desc')}</p>
                            <div className="text-2xl md:text-3xl font-black">22°C / 85%</div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('planning_page.humidity_level')}</span>
                        </div>
                    </div>

                    {/* Timeline section */}
                    <div className="lg:col-span-8">
                        <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-border flex flex-wrap items-center justify-between gap-4">
                                <h3 className="text-lg md:text-xl font-bold flex items-center gap-3 text-foreground">
                                    <Calendar size={20} className="text-accent" />
                                    {t('planning_page.today_timeline')}
                                </h3>
                                <div className="flex bg-foreground/5 p-1 rounded-xl w-full sm:w-auto">
                                    <button className="flex-1 sm:flex-none px-4 py-2 bg-accent text-background rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest">{t('planning_page.list')}</button>
                                    <button className="flex-1 sm:flex-none px-4 py-2 text-foreground/40 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-foreground transition-colors">{t('planning_page.board')}</button>
                                </div>
                            </div>
                            <div className="p-4 md:p-8 space-y-6 md:space-y-8 relative">
                                <div className="absolute left-[39px] md:left-[59px] top-4 md:top-8 bottom-4 md:bottom-8 w-px bg-border"></div>
                                {events.map((event) => (
                                    <div key={event.id} className="flex gap-6 md:gap-10 items-start relative z-10">
                                        <div className="w-10 md:w-16 shrink-0 text-right">
                                            <span className="text-[8px] md:text-[10px] font-black text-foreground/30 uppercase tracking-widest">{event.time}</span>
                                        </div>
                                        <div className="p-4 md:p-6 bg-foreground/[0.02] border border-border rounded-[1.5rem] md:rounded-[2rem] flex-1 group hover:bg-foreground/[0.05] hover:border-accent/20 transition-all text-foreground overflow-hidden">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="overflow-hidden">
                                                    <h4 className="text-base md:text-lg font-bold text-foreground tracking-tight truncate">{event.title}</h4>
                                                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 md:gap-4 mt-1 text-foreground/50 text-[10px] md:text-xs font-medium">
                                                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-accent" /> {event.location}</span>
                                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {event.type} {t('planning_page.task_type')}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {event.status === 'completed' ? (
                                                        <CheckCircle2 size={20} className="text-accent md:w-6 md:h-6" />
                                                    ) : event.status === 'upcoming' ? (
                                                        <Circle size={20} className="text-foreground/20 md:w-6 md:h-6" />
                                                    ) : (
                                                        <Circle size={20} className="text-yellow-400 animate-pulse md:w-6 md:h-6" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
