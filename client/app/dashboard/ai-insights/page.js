'use client'

import React, { useEffect, useState } from 'react'
import {
    Brain,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Droplets,
    Zap
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import PredictionChart from '@/components/dashboard/ai/PredictionChart'
import DigitalTwinViewer from '@/components/dashboard/ai/DigitalTwinViewer'
import AIRecommendations from '@/components/dashboard/ai/AIRecommendations'
import ReportingCard from '@/components/dashboard/ai/ReportingCard'
import { useAIInsights } from '@/hooks/useAIInsights'

const AIInsightsPage = () => {
    const { alerts, zones, digitalTwin, predictions, isLoading } = useAIInsights()
    const [selectedZone, setSelectedZone] = useState(null)
    const [stats, setStats] = useState({
        soilHealth: 'Thinking...',
        stressLevel: 0,
        moistureLoss: 0,
        nextIrrigation: 'Checking...'
    })

    // Debugging local environment
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('🔍 AI Dashboard Debug:', {
                apiURL: process.env.NEXT_PUBLIC_API_URL || 'FALLBACK ACTIVE',
                zonesCount: zones.data?.length,
                isLoading: isLoading
            })
        }
    }, [zones.data, isLoading])

    useEffect(() => {
        if (zones.data && zones.data.length > 0 && !selectedZone) {
            setSelectedZone(zones.data[0])
        }
    }, [zones.data, selectedZone])

    useEffect(() => {
        // Simulated update based on actual sensor data if available
        if (selectedZone) {
            setStats({
                soilHealth: 'Good',
                stressLevel: 18,
                moistureLoss: 0.9,
                nextIrrigation: '4 hours'
            })
        }
    }, [selectedZone])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-accent animate-pulse">
                    <Brain size={48} className="animate-bounce" />
                    <p className="font-bold tracking-widest uppercase text-xs">AI Brain Synchronizing...</p>
                </div>
            </div>
        )
    }

    const unreadAlertsCount = alerts.data?.filter(a => !a.isRead).length || 0

    return (
        <div className="ml-64 p-10 min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-accent/20 rounded-lg">
                                <Brain className="text-accent" size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-white">AI Insights</h1>
                        </div>
                        <p className="text-gray-400">Predictive analytics and smart decision support for your farm.</p>
                    </div>

                    {/* Single Zone Status Indicator */}
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Monitoring</span>
                            <span className="text-sm font-bold text-white">{selectedZone?.name || 'Main Field'}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(21,255,113,0.5)]"></div>
                            <span className="text-[11px] font-bold text-accent uppercase tracking-tighter">Live System</span>
                        </div>
                    </div>
                </div>

                {/* AI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-[#0a0f0b] border-white/5 relative overflow-hidden group hover:border-accent/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                            <Brain size={60} />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Soil Health (AI)</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className={`text-3xl font-bold ${stats.soilHealth === 'Good' ? 'text-accent' : 'text-white'}`}>
                                    {stats.soilHealth}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <CheckCircle2 size={10} className="text-accent" /> Normal Range
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                                <Zap size={20} className="text-accent shadow-[0_0_15px_rgba(21,255,113,0.3)]" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-[#0a0f0b] border-white/5 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Plant Stress Level</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-white">{stats.stressLevel}%</h3>
                                <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1 font-medium">
                                    <TrendingUp size={10} /> +2% variation
                                </p>
                            </div>
                            <div className="flex-1 max-w-[80px] h-2 bg-white/5 rounded-full mb-2 ml-4 overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: `${stats.stressLevel}%` }}></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-[#0a0f0b] border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Evaporation Rate</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-white">{stats.moistureLoss}</h3>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">Percent / hour</p>
                            </div>
                            <TrendingDown className="text-blue-500 mb-2" size={24} />
                        </div>
                    </Card>

                    <Card className="p-6 bg-accent border-none relative overflow-hidden group shadow-2xl shadow-accent/10 hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Droplets size={60} className="text-[#020603]" />
                        </div>
                        <p className="text-xs font-bold text-[#020603]/60 uppercase tracking-widest mb-4 font-black">AI Recommendation</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-[#020603] leading-tight">Next Cycle in {stats.nextIrrigation}</h3>
                                <p className="text-[10px] text-[#020603]/60 mt-2 flex items-center gap-1 font-black uppercase">
                                    <CheckCircle2 size={10} /> Model Optimized
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Visuals Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Predictions Chart */}
                    <Card className="lg:col-span-2 p-8 bg-[#0a0f0b] border-white/5 shadow-2xl group hover:border-accent/10 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-white">Moisture Prediction (7 Days)</h2>
                                    <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black uppercase rounded-md border border-accent/20">Proactive</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Deep learning forecast tailored to {selectedZone?.name || 'Active Zone'}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(21,255,113,0.5)]"></div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Predicted</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <PredictionChart
                                zoneId={selectedZone?.id}
                                data={predictions.data?.predictions}
                            />
                        </div>
                    </Card>

                    {/* Recommendations & Side Info */}
                    <div className="space-y-8">
                        <AIRecommendations zoneId={selectedZone?.id} />
                        <DigitalTwinViewer zoneId={selectedZone?.id} data={digitalTwin.data} />
                    </div>
                </div>

                {/* Reporting Section */}
                <ReportingCard zoneId={selectedZone?.name} />

                {/* Alert Logs */}
                <Card className="p-8 bg-[#0a0f0b] border-white/5 shadow-2xl group hover:border-red-500/10 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Security & Smart Alerts</h2>
                                <p className="text-xs text-gray-500">Real-time incident detection via machine learning</p>
                            </div>
                        </div>
                        {unreadAlertsCount > 0 && (
                            <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 uppercase tracking-widest">
                                {unreadAlertsCount} New Alerts
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerts.data?.length > 0 ? (
                            alerts.data.slice(0, 4).map((alert, i) => (
                                <div key={alert.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group/alert">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${alert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 group-hover/alert:bg-red-500/20' :
                                            alert.severity === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500 group-hover/alert:bg-yellow-500/20' :
                                                'bg-accent/10 text-accent group-hover/alert:bg-accent/20'
                                            }`}>
                                            {alert.severity === 'CRITICAL' ? <AlertTriangle size={20} /> :
                                                alert.severity === 'WARNING' ? <AlertTriangle size={20} /> :
                                                    <Brain size={20} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-bold text-white">{alert.title}</p>
                                                {!alert.isRead && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-1">{alert.message}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-500 font-bold block mb-1 uppercase opacity-60">
                                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button className="text-[9px] text-accent font-black uppercase tracking-tighter opacity-0 group-hover/alert:opacity-100 transition-all hover:underline">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <CheckCircle2 size={32} className="text-accent/40 mb-3" />
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No Active Incidents Detected</p>
                                <p className="text-[10px] text-gray-600 mt-1">Smart Monitor is scanning your farm for anomalies</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default AIInsightsPage
