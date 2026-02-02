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
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import PredictionChart from '@/components/dashboard/ai/PredictionChart'
import DigitalTwinViewer from '@/components/dashboard/ai/DigitalTwinViewer'
import AIRecommendations from '@/components/dashboard/ai/AIRecommendations'
import ReportingCard from '@/components/dashboard/ai/ReportingCard'
import { useAIInsights } from '@/hooks/useAIInsights'

const AIInsightsPage = () => {
    const { t } = useTranslation()
    const { alerts, zones, digitalTwin, predictions, latestSensor, isLoading } = useAIInsights()
    const [selectedZone, setSelectedZone] = useState(null)
    const [stats, setStats] = useState({
        soilHealth: 'Syncing...',
        stressLevel: 0,
        moistureLoss: 0,
        ec: 1.2,
        moisture: 0,
        nextIrrigation: 'Checking...'
    })

    // Helper function to calculate soil health based on moisture if AI doesn't provide it
    const calculateSoilHealth = (moisture) => {
        if (moisture === null || moisture === undefined) return 'Unknown'
        if (moisture >= 40 && moisture <= 70) return 'Excellent'
        if (moisture >= 30 && moisture < 40) return 'Good'
        if (moisture >= 20 && moisture < 30) return 'Fair'
        if (moisture < 20) return 'Poor'
        if (moisture > 70) return 'Wet'
        return 'Unknown'
    }

    useEffect(() => {
        if (latestSensor.data) {
            const data = latestSensor.data
            // Use AI-provided soil_health or calculate from moisture
            const soilHealth = data.soil_health
                ? data.soil_health.charAt(0).toUpperCase() + data.soil_health.slice(1)
                : calculateSoilHealth(data.moisture)

            setStats({
                soilHealth: soilHealth,
                stressLevel: Math.round(data.stress_level || 0),
                moistureLoss: data.moisture_loss_rate || 0,
                ec: data.ec || (data.nitrogen ? (data.nitrogen / 50).toFixed(1) : '1.2'),
                moisture: data.moisture || 0,
                nextIrrigation: data.moisture < 30 ? 'Immediate' : '4 hours'
            })
        }
    }, [latestSensor.data])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-accent animate-pulse">
                    <Brain size={48} className="animate-bounce" />
                    <p className="font-bold tracking-widest uppercase text-xs">{t('ai_insights_page.syncing')}</p>
                </div>
            </div>
        )
    }

    const unreadAlertsCount = alerts.data?.filter(a => !a.isRead).length || 0

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background transition-all duration-500">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-accent/20 rounded-lg">
                                <Brain className="text-accent" size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">{t('ai_insights_page.title')}</h1>
                        </div>
                        <p className="text-foreground/50">{t('ai_insights_page.description')}</p>
                    </div>

                    {/* Single Zone Status Indicator */}
                    <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-2xl border border-border">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('ai_insights_page.active_monitoring')}</span>
                            <span className="text-sm font-bold text-foreground">{selectedZone?.name || 'Main Field'}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-border"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(21,255,113,0.5)]"></div>
                            <span className="text-[11px] font-bold text-accent uppercase tracking-tighter">{t('ai_insights_page.live_system')}</span>
                        </div>
                    </div>
                </div>

                {/* AI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card className="p-6 bg-card border-border relative overflow-hidden group hover:border-accent/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-foreground">
                            <Brain size={60} />
                        </div>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4">{t('ai_insights_page.soil_health_ai')}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className={`text-3xl font-bold ${stats.moisture < 20 ? 'text-red-500' : stats.soilHealth === 'Excellent' ? 'text-accent' : 'text-foreground'}`}>
                                    {stats.moisture < 20 ? 'Poor' : stats.soilHealth}
                                </h3>
                                <p className="text-[10px] text-foreground/50 mt-1 flex items-center gap-1">
                                    {stats.moisture < 20 ? (
                                        <>
                                            <AlertTriangle size={10} className="text-red-500" /> {t('ai_insights_page.critical_level')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={10} className="text-accent" /> {t('ai_insights_page.normal_range')}
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                                <Zap size={20} className={stats.moisture < 20 ? "text-red-500" : "text-accent shadow-[0_0_15px_rgba(21,255,113,0.3)]"} />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4">{t('ai_insights_page.plant_stress')}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-foreground">{stats.stressLevel}%</h3>
                                <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1 font-medium">
                                    <TrendingUp size={10} /> +2% variation
                                </p>
                            </div>
                            <div className="flex-1 max-w-[80px] h-2 bg-foreground/5 rounded-full mb-2 ml-4 overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: `${stats.stressLevel}%` }}></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4">{t('ai_insights_page.evaporation_rate')}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-foreground">{stats.moistureLoss}</h3>
                                <p className="text-[10px] text-foreground/50 mt-1 font-medium">{t('ai_insights_page.percent_hour')}</p>
                            </div>
                            <TrendingDown className="text-blue-500 mb-2" size={24} />
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4">{t('ai_insights_page.ec')}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className={`text-3xl font-bold ${stats.moisture < 20 ? 'text-red-500' : 'text-foreground'}`}>
                                    {stats.ec || '1.2'}
                                </h3>
                                <p className="text-[10px] text-foreground/50 mt-1 font-medium flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${stats.moisture < 20 ? 'bg-red-500' : 'bg-accent'}`}></span>
                                    {stats.moisture < 20 ? t('ai_insights_page.critical_no_water') : t('ai_insights_page.optimal_range')}
                                </p>
                            </div>
                            {stats.moisture < 20 ? (
                                <AlertTriangle className="text-red-500 mb-2" size={24} />
                            ) : (
                                <Droplets className="text-emerald-500 mb-2" size={24} />
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 bg-accent border-none relative overflow-hidden group shadow-2xl shadow-accent/10 hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Droplets size={60} className="text-background" />
                        </div>
                        <p className="text-xs font-bold text-background/60 uppercase tracking-widest mb-4 font-black">{t('ai_insights_page.ai_recommendation')}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-background leading-tight">{t('ai_insights_page.next_cycle')} {stats.nextIrrigation}</h3>
                                <p className="text-[10px] text-background/60 mt-2 flex items-center gap-1 font-black uppercase">
                                    <CheckCircle2 size={10} /> {t('ai_insights_page.model_optimized')}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Visuals Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Predictions Chart */}
                    <Card className="lg:col-span-2 p-8 bg-card border-border shadow-2xl group hover:border-accent/10 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-foreground">{t('ai_insights_page.moisture_prediction')}</h2>
                                    <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black uppercase rounded-md border border-accent/20">{t('ai_insights_page.proactive')}</span>
                                </div>
                                <p className="text-xs text-foreground/50 mt-1">Deep learning forecast tailored to {selectedZone?.name || 'Active Zone'}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-lg border border-border">
                                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(21,255,113,0.5)]"></div>
                                    <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{t('ai_insights_page.ai_predicted')}</span>
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
                <Card className="p-8 bg-card border-border shadow-2xl group hover:border-red-500/10 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{t('ai_insights_page.security_alerts')}</h2>
                                <p className="text-xs text-foreground/50">{t('ai_insights_page.real_time_detection')}</p>
                            </div>
                        </div>
                        {unreadAlertsCount > 0 && (
                            <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 uppercase tracking-widest">
                                {unreadAlertsCount} {t('ai_insights_page.new_alerts')}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerts.data?.length > 0 ? (
                            alerts.data.slice(0, 4).map((alert, i) => (
                                <div key={alert.id} className="flex items-center justify-between p-5 bg-foreground/[0.02] border border-border rounded-2xl hover:bg-foreground/[0.08] hover:border-border transition-all group/alert">
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
                                                <p className="text-sm font-bold text-foreground">{alert.title}</p>
                                                {!alert.isRead && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                                            </div>
                                            <p className="text-xs text-foreground/50 line-clamp-1">{alert.message}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-foreground/40 font-bold block mb-1 uppercase opacity-60">
                                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button className="text-[9px] text-accent font-black uppercase tracking-tighter opacity-0 group-hover/alert:opacity-100 transition-all hover:underline">
                                            {t('ai_insights_page.details')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-foreground/[0.02] rounded-3xl border border-dashed border-border px-4">
                                <CheckCircle2 size={32} className="text-accent/40 mb-3" />
                                <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest text-center">{t('ai_insights_page.no_incidents')}</p>
                                <p className="text-[10px] text-foreground/30 mt-1 text-center">{t('ai_insights_page.scanning_anomalies')}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default AIInsightsPage
