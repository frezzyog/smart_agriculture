'use client'

import React from 'react'
import { Droplets, History, Download, Filter, Droplet, ArrowRight, CheckCircle2, Clock } from 'lucide-react'

export default function IrrigationLogsPage() {
    const logs = [
        { id: 1, date: 'Jan 26, 2026', time: '08:00 AM', zone: 'Zone A', duration: '15m', source: 'Auto-Pilot', volume: '120L', status: 'Success' },
        { id: 2, date: 'Jan 26, 2026', time: '04:30 AM', zone: 'Zone B', duration: '10m', source: 'Manual', volume: '80L', status: 'Success' },
        { id: 3, date: 'Jan 25, 2026', time: '11:00 PM', zone: 'Zone C', duration: '20m', source: 'Smart Cycle', volume: '160L', status: 'Success' },
        { id: 4, date: 'Jan 25, 2026', time: '06:00 PM', zone: 'Zone A', duration: '12m', source: 'Auto-Pilot', volume: '100L', status: 'Success' },
        { id: 5, date: 'Jan 25, 2026', time: '12:00 PM', zone: 'Zone B', duration: '15m', source: 'Manual', volume: '120L', status: 'Warning' },
    ]

    return (
        <div className="ml-64 p-10 min-h-screen bg-background text-white">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            Irrigation <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Logs</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Historical data of all watering events and water consumption.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-wider">
                            <Filter size={18} />
                            Filter Results
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-accent text-[#020603] rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {[
                        { label: 'Total Water Used', val: '4,250L', sub: 'Last 30 days', icon: Droplets, col: 'text-accent' },
                        { label: 'Avg. Duration', val: '14m', sub: 'Per session', icon: Clock, col: 'text-blue-400' },
                        { label: 'Active Cycles', val: '12', sub: 'In the last 24h', icon: History, col: 'text-green-400' },
                        { label: 'System Health', val: '99%', sub: 'Valve efficiency', icon: CheckCircle2, col: 'text-accent' }
                    ].map((card, i) => (
                        <div key={i} className="bg-card p-6 rounded-[2.5rem] border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <card.icon size={20} className={card.col} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{card.label}</span>
                            </div>
                            <div className="text-3xl font-black mb-1">{card.val}</div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                            <History size={22} className="text-accent" />
                            Activity Logs
                        </h3>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr>
                                    <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date / Time</th>
                                    <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Zone</th>
                                    <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration</th>
                                    <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Volume</th>
                                    <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Source</th>
                                    <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="p-8">
                                            <div className="font-bold text-white">{log.date}</div>
                                            <div className="text-xs text-gray-500 mt-1">{log.time}</div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-accent"></div>
                                                <span className="font-bold text-gray-300">{log.zone}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 font-bold text-gray-300">{log.duration}</td>
                                        <td className="p-8 font-black text-white">{log.volume}</td>
                                        <td className="p-8">
                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-400">{log.source}</span>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${log.status === 'Success' ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
