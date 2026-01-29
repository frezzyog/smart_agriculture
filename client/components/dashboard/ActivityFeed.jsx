'use client'

import React from 'react'
import { Sparkles, Zap, AlertTriangle, CloudRain, Wind, Activity } from 'lucide-react'

const ActivityFeed = () => {
    const activities = [
        {
            id: 1,
            type: 'ai-action',
            content: 'AI Engine: Recommended irrigation for Zone C based on moisture drop',
            time: '10:05 AM',
            icon: Sparkles,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            border: 'border-purple-200'
        },
        {
            id: 2,
            type: 'system',
            content: 'Relay 1 triggered: Fertilizer Pump ACTIVE',
            time: '10:00 AM',
            icon: Zap,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            border: 'border-orange-200'
        },
        {
            id: 3,
            type: 'network',
            content: 'ESP32: Batch data synced via Wi-Fi',
            time: '09:45 AM',
            icon: Wind,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-200'
        },
        {
            id: 4,
            type: 'weather',
            content: 'Rain Sensors: Detected precipitation - Pausing pumps',
            time: '09:15 AM',
            icon: CloudRain,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            border: 'border-indigo-200'
        },
        {
            id: 5,
            type: 'warning',
            content: 'Low Soil Moisture (32%) detected in Zone A',
            time: '08:45 AM',
            icon: AlertTriangle,
            color: 'text-rose-600',
            bg: 'bg-rose-100',
            border: 'border-rose-200'
        }
    ]

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-foreground rounded-xl text-background shadow-lg shadow-foreground/10">
                        <Activity size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">System Logs</h3>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Real-time Feed</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-xs font-bold text-foreground/60 transition-colors uppercase tracking-wider">
                    View All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                <div className="space-y-6 relative ml-3 before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent before:h-full">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative flex gap-5 group items-start">
                            <div className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ring-4 ring-card transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${activity.bg} ${activity.color}`}>
                                <activity.icon size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 pt-1 p-4 rounded-2xl transition-colors hover:bg-foreground/5 -ml-2 pl-4">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">
                                        {activity.type}
                                    </p>
                                    <span className="text-[10px] font-bold text-foreground/60 bg-foreground/5 px-2 py-0.5 rounded-full border border-border">
                                        {activity.time}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-foreground/80 leading-snug group-hover:text-foreground transition-colors">
                                    {activity.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ActivityFeed
