'use client'

import React from 'react'
import { Calendar, Plus, Clock, MapPin, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

export default function PlanningPage() {
    const events = [
        { id: 1, title: 'Nutrient Injection', time: '08:00 AM', location: 'Zone A', status: 'completed', type: 'System' },
        { id: 2, title: 'Soil PH Test', time: '11:30 AM', location: 'Zone B', status: 'upcoming', type: 'Manual' },
        { id: 3, title: 'Harvest Preparation', time: '02:00 PM', location: 'Zone C', status: 'pending', type: 'Team' },
        { id: 4, title: 'Auto-Irrigation Sync', time: '06:00 PM', location: 'All Zones', status: 'upcoming', type: 'System' },
    ]

    return (
        <div className="ml-64 p-10 min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 flex items-center gap-3">
                            Farm <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Planning</span>
                        </h1>
                        <p className="text-foreground/50 font-medium">Schedule and manage daily agricultural operations and labor.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                        <Plus size={18} />
                        Create New Task
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Calendar Sidebar (Mock) */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="bg-card p-8 rounded-[2.5rem] border border-border">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-foreground">January 2026</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors">{'<'}</button>
                                    <button className="p-2 bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors">{'>'}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <span key={`${d}-${i}`} className="text-[10px] font-black text-foreground/20 text-center uppercase">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 31 }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`h-10 rounded-xl text-xs font-bold transition-all ${i + 1 === 26 ? 'bg-accent text-background' : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-accent rounded-[2.5rem] p-8 text-background">
                            <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                <AlertCircle size={20} />
                                Weather Alert
                            </h4>
                            <p className="text-sm font-bold opacity-70 mb-6">Heavy rain predicted for Tuesday. Consider covering young seedlings in Zone B.</p>
                            <div className="text-3xl font-black">22°C / 85%</div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Humidity Level</span>
                        </div>
                    </div>

                    {/* Timeline section */}
                    <div className="lg:col-span-8">
                        <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden">
                            <div className="p-8 border-b border-border flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
                                    <Calendar size={20} className="text-accent" />
                                    Today's Timeline
                                </h3>
                                <div className="flex bg-foreground/5 p-1 rounded-xl">
                                    <button className="px-4 py-2 bg-accent text-background rounded-lg text-xs font-bold uppercase tracking-widest">List</button>
                                    <button className="px-4 py-2 text-foreground/40 rounded-lg text-xs font-bold uppercase tracking-widest hover:text-foreground transition-colors">Board</button>
                                </div>
                            </div>
                            <div className="p-8 space-y-8 relative">
                                <div className="absolute left-[59px] top-8 bottom-8 w-px bg-border"></div>
                                {events.map((event) => (
                                    <div key={event.id} className="flex gap-10 items-start relative z-10">
                                        <div className="w-16 shrink-0 text-right">
                                            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{event.time}</span>
                                        </div>
                                        <div className="p-6 bg-foreground/[0.02] border border-border rounded-[2rem] flex-1 group hover:bg-foreground/[0.05] hover:border-accent/20 transition-all text-foreground">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-foreground tracking-tight">{event.title}</h4>
                                                    <div className="flex items-center gap-4 mt-1 text-foreground/50 text-xs font-medium">
                                                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-accent" /> {event.location}</span>
                                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {event.type} Task</span>
                                                    </div>
                                                </div>
                                                {event.status === 'completed' ? (
                                                    <CheckCircle2 size={24} className="text-accent" />
                                                ) : event.status === 'upcoming' ? (
                                                    <Circle size={24} className="text-foreground/20" />
                                                ) : (
                                                    <Circle size={24} className="text-yellow-400 animate-pulse" />
                                                )}
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
