'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import RainSensorCard from '@/components/dashboard/RainSensorCard'
import SoilSensorCard from '@/components/dashboard/SoilSensorCard'
import SevenInOneSensorCard from '@/components/dashboard/SevenInOneSensorCard'
import PowerStatsCard from '@/components/dashboard/PowerStatsCard'
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard'
import RecentTransactionsMinimal from '@/components/dashboard/RecentTransactionsMinimal'
import WeatherCard from '@/components/dashboard/WeatherCard'
import { Droplet, LayoutDashboard, Wallet, Sprout } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'
import { getExpenses } from '@/lib/api'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const { t } = useTranslation()
    const { user, loading } = useAuth()
    const router = useRouter()
    const sensorData = useRealtimeSensorData()
    const [expenses, setExpenses] = React.useState([])
    const [activeTab, setActiveTab] = useState('soil') // 'soil' or 'balance'

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    React.useEffect(() => {
        if (!user) return
        const fetchExpenses = async () => {
            try {
                const data = await getExpenses()
                setExpenses(data)
            } catch (error) {
                console.error('Error fetching expenses:', error)
            }
        }
        fetchExpenses()
    }, [user])

    const statusText = sensorData.connected ? t('dashboard.live_data') : t('dashboard.connecting')

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background transition-all duration-500">
            <div className="max-w-[1600px] mx-auto space-y-12">

                {/* Dashboard Main Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight drop-shadow-sm flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('soil')}
                                className={`transition-all duration-300 ${activeTab === 'soil' ? 'text-accent underline decoration-4 decoration-accent/30 underline-offset-8' : 'text-foreground/20 hover:text-foreground/40'}`}
                            >
                                Soil Data
                            </button>
                            <span className="text-foreground/10 font-thin">/</span>
                            <button
                                onClick={() => setActiveTab('balance')}
                                className={`transition-all duration-300 ${activeTab === 'balance' ? 'text-emerald-500 underline decoration-4 decoration-emerald-500/30 underline-offset-8' : 'text-foreground/20 hover:text-foreground/40'}`}
                            >
                                Balance
                            </button>
                        </h1>
                        <p className="text-foreground/40 font-medium mt-3 flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            {activeTab === 'soil' ? 'Environmental telemetry' : 'Financial overview'}
                        </p>
                    </div>

                    {/* Quick Toggle UI */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
                        <button
                            onClick={() => setActiveTab('soil')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs ${activeTab === 'soil' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-foreground/40 hover:text-foreground/60'}`}
                        >
                            <Sprout size={14} />
                            Soil Data
                        </button>
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs ${activeTab === 'balance' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-foreground/40 hover:text-foreground/60'}`}
                        >
                            <Wallet size={14} />
                            Balance
                        </button>
                    </div>
                </div>

                {/* COMPACT SHARED STATS: Small boxes under the title */}
                <div className="flex flex-wrap gap-4">
                    {/* Compact Weather Box */}
                    <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/5 flex items-center gap-4 min-w-[200px] group">
                        <div className="p-2 bg-sky-500/10 rounded-xl text-sky-500 group-hover:scale-110 transition-transform">
                            <Droplet size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-0.5">Atmosphere</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-foreground">28°C</span>
                                <span className="text-xs font-bold text-foreground/40">72% Humidity</span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Power Box */}
                    <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/5 flex items-center gap-4 min-w-[200px] group">
                        <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-0.5">Power System</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-foreground">{Math.round(sensorData.battery ?? 85)}%</span>
                                <span className="text-xs font-bold text-foreground/40">{parseFloat(sensorData.voltage ?? 12.8).toFixed(1)}V</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABBED CONTENT: Focused on Soil or Balance specifically */}
                <div className="transition-all duration-500 border-t border-border pt-8">
                    {activeTab === 'soil' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                    <Sprout size={20} className="animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Soil Data Monitor</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SoilSensorCard
                                        moisture={sensorData.moisture.toFixed(0)}
                                        status={statusText}
                                    />
                                    <RainSensorCard
                                        isRaining={sensorData.rain > 50}
                                        rainValue={sensorData.rain.toFixed(0)}
                                        status={statusText}
                                    />
                                </div>
                                <SevenInOneSensorCard
                                    nitrogen={sensorData.nitrogen}
                                    phosphorus={sensorData.phosphorus}
                                    potassium={sensorData.potassium}
                                    pH={sensorData.pH.toFixed(1)}
                                    ec={sensorData.ec.toFixed(1)}
                                    temp={sensorData.temp.toFixed(1)}
                                    humidity={sensorData.humidity.toFixed(1)}
                                    status={statusText}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <Wallet size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Financial Balance</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <ExpenseSummaryCard
                                        totalBalance={expenses.length > 0 ? `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}` : '$0'}
                                    />
                                </div>
                                <div>
                                    <RecentTransactionsMinimal transactions={expenses} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
