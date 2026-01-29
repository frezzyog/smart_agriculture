'use client'

import React, { useState, useEffect } from 'react'
import {
    Droplets,
    History,
    Download,
    Filter,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Search,
    Loader2,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react'
import { getIrrigationLogs } from '@/lib/api'

export default function IrrigationLogsPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const data = await getIrrigationLogs()
            setLogs(Array.isArray(data) ? data : [])
            setError(null)
        } catch (err) {
            console.error('Failed to fetch irrigation logs:', err)
            setError('Failed to load logs. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log =>
        log.device?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.triggeredBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate aggregated stats from real data
    const stats = {
        totalEvents: logs.length,
        avgDuration: logs.length > 0 ? (logs.reduce((acc, curr) => acc + (curr.duration || 0), 0) / logs.length).toFixed(1) : 0,
        recentAuto: logs.filter(l => l.triggeredBy === 'AI_SYSTEM' || l.triggeredBy === 'AI_AGENT').length,
        successRate: '100%' // Minimal placeholder since we don't handle failures in logs yet
    }

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background text-foreground transition-all duration-500">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-2 flex items-center gap-3">
                            Irrigation <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Logs</span>
                        </h1>
                        <p className="text-sm md:text-base text-foreground/50 font-medium">Historical data of all watering events and water consumption.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-accent/40"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-accent text-background rounded-xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {[
                        { label: 'Total Events', val: stats.totalEvents, sub: 'All recorded actions', icon: History, col: 'text-accent' },
                        { label: 'Avg. Duration', val: `${stats.avgDuration}s`, sub: 'Per session', icon: Clock, col: 'text-blue-400' },
                        { label: 'AI Triggered', val: stats.recentAuto, sub: 'Automated cycles', icon: Droplets, col: 'text-purple-400' },
                        { label: 'System Health', val: stats.successRate, sub: 'Execution reliability', icon: CheckCircle2, col: 'text-accent' }
                    ].map((card, i) => (
                        <div key={i} className="bg-card p-6 md:p-8 rounded-[2rem] border border-border relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-foreground/5 ${card.col}`}>
                                    <card.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{card.label}</span>
                            </div>
                            <div className="text-3xl font-black mb-1 text-foreground">{card.val}</div>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Logs Table */}
                <div className="bg-card rounded-[2rem] border border-border overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg md:text-xl font-bold flex items-center gap-3 text-foreground">
                            <History size={22} className="text-accent" />
                            Activity Logs
                        </h3>
                        {loading && <Loader2 size={18} className="animate-spin text-accent" />}
                    </div>

                    {error ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                            <AlertTriangle size={48} className="text-red-500/50" />
                            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs">{error}</p>
                            <button onClick={fetchLogs} className="px-6 py-2 bg-foreground/5 rounded-lg text-[10px] font-black uppercase hover:bg-foreground/10">Retry</button>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-foreground/[0.02] border-b border-border">
                                    <tr>
                                        <th className="p-5 md:p-8 text-[10px] font-black text-foreground/40 uppercase tracking-widest min-w-[150px]">Date / Time</th>
                                        <th className="p-5 md:p-8 text-[10px] font-black text-foreground/40 uppercase tracking-widest min-w-[150px]">Device / Zone</th>
                                        <th className="p-5 md:p-8 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Duration</th>
                                        <th className="p-5 md:p-8 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Trigger</th>
                                        <th className="p-5 md:p-8 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="p-5 md:p-8"><div className="h-10 bg-foreground/5 rounded-lg w-32"></div></td>
                                                <td className="p-5 md:p-8"><div className="h-10 bg-foreground/5 rounded-lg w-40"></div></td>
                                                <td className="p-5 md:p-8"><div className="h-10 bg-foreground/5 rounded-lg w-16"></div></td>
                                                <td className="p-5 md:p-8"><div className="h-10 bg-foreground/5 rounded-lg w-24"></div></td>
                                                <td className="p-5 md:p-8"><div className="h-10 bg-foreground/5 rounded-lg w-20"></div></td>
                                            </tr>
                                        ))
                                    ) : filteredLogs.length > 0 ? (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-foreground/[0.01] transition-colors group">
                                                <td className="p-5 md:p-8 whitespace-nowrap">
                                                    <div className="font-bold text-foreground text-sm md:text-base">
                                                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[10px] md:text-xs text-foreground/40 mt-1 font-medium">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="p-5 md:p-8 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${log.action === 'ON' ? 'bg-accent shadow-[0_0_8px_rgba(21,255,113,0.5)]' : 'bg-foreground/20'}`}></div>
                                                        <div className="font-bold text-foreground/70 text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                                                            {log.device?.name || 'Unknown Device'} {log.device?.zone?.name ? `(${log.device.zone.name})` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] md:text-xs text-foreground/30 font-bold uppercase tracking-tighter mt-1">
                                                        {log.device?.deviceId || log.device_id}
                                                    </div>
                                                </td>
                                                <td className="p-5 md:p-8">
                                                    <div className="flex items-center gap-2 font-bold text-foreground/70 text-sm md:text-base">
                                                        {log.duration ? `${log.duration}s` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-5 md:p-8">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${(log.triggeredBy === 'AI_SYSTEM' || log.triggeredBy === 'AI_AGENT')
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        : 'bg-foreground/5 text-foreground/50 border border-border'
                                                        }`}>
                                                        {log.triggeredBy?.replace('_', ' ') || 'SYSTEM'}
                                                    </span>
                                                </td>
                                                <td className="p-5 md:p-8">
                                                    <span className={`px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest ${log.action === 'ON' ? 'bg-accent/10 text-accent' : 'bg-foreground/10 text-foreground/40'}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <History size={40} className="text-foreground/10" />
                                                    <p className="text-foreground/30 font-bold uppercase tracking-widest text-[10px]">No logs found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
