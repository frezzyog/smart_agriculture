'use client'

import React from 'react'
import { AlertTriangle, CheckCircle, Info, RefreshCcw } from 'lucide-react'

const alerts = [
    {
        id: 1,
        title: 'Low Moisture Detected',
        description: 'Sector 01: Moisture dropped below 60% threshold',
        time: '10:24 AM',
        type: 'critical',
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-500/10'
    },
    {
        id: 2,
        title: 'Battery Fully Charged',
        description: 'Switching Array B to maintenance mode',
        time: '09:15 AM',
        type: 'info',
        icon: RefreshCcw,
        color: 'text-accent',
        bg: 'bg-accent/10'
    }
]

const RecentAlerts = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <RefreshCcw size={20} className="text-accent" />
                <h3 className="text-xl font-bold text-white tracking-tight">Recent Alerts</h3>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-6 bg-card rounded-[2rem] border border-white/5 group hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl ${alert.bg} flex items-center justify-center ${alert.color}`}>
                                <alert.icon size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white tracking-tight">{alert.title}</h4>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">{alert.description}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-gray-500 block mb-2">{alert.time}</span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${alert.type === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-accent/20 text-accent'}`}>
                                {alert.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentAlerts
