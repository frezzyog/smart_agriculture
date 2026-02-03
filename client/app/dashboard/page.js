'use client'

import React, { useState, useEffect } from 'react'
import CompactWeatherCard from '@/components/dashboard/CompactWeatherCard'
import CompactPowerCard from '@/components/dashboard/CompactPowerCard'
import RainSensorCard from '@/components/dashboard/RainSensorCard'
import SoilSensorCard from '@/components/dashboard/SoilSensorCard'
import SevenInOneSensorCard from '@/components/dashboard/SevenInOneSensorCard'
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard'
import RecentTransactionsMinimal from '@/components/dashboard/RecentTransactionsMinimal'
import { Droplet, LayoutDashboard, Wallet, Sprout, Zap } from 'lucide-react'
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
    const [expenses, setExpenses] = useState([])
    const [activeTab, setActiveTab] = useState('soil') // 'soil' or 'balance'

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
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
                                className={`transition-all duration-300 ${activeTab === 'soil' ? 'text-accent underline decoration-4 decoration-accent/30 underline-offset-8' : 'text-foreground/40 hover:text-foreground/60'}`}
                            >
                                {t('dashboard.soil_data')}
                            </button>
                            <span className="text-foreground/10 font-thin">/</span>
                            <button
                                onClick={() => setActiveTab('balance')}
                                className={`transition-all duration-300 ${activeTab === 'balance' ? 'text-emerald-500 underline decoration-4 decoration-emerald-500/30 underline-offset-8' : 'text-foreground/40 hover:text-foreground/60'}`}
                            >
                                {t('dashboard.balance')}
                            </button>
                        </h1>
                        <p className="text-foreground/40 font-medium mt-3 flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            {activeTab === 'soil' ? t('dashboard.environmental_telemetry') : t('dashboard.financial_overview')}
                        </p>
                    </div>

                    {/* Quick Toggle UI */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
                        <button
                            onClick={() => setActiveTab('soil')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs ${activeTab === 'soil' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-foreground/40 hover:text-foreground/60'}`}
                        >
                            <Sprout size={14} />
                            {t('dashboard.soil_data')}
                        </button>
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs ${activeTab === 'balance' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-foreground/40 hover:text-foreground/60'}`}
                        >
                            <Wallet size={14} />
                            {t('dashboard.balance')}
                        </button>
                    </div>
                </div>

                {/* MINI STATUS BAR: Pill style matching reference */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <CompactWeatherCard />
                    <CompactPowerCard
                        percentage={Math.round(sensorData.battery ?? 85)}
                        voltage={parseFloat(sensorData.voltage ?? 12.8).toFixed(1)}
                        charging={(sensorData.voltage ?? 0) > 12.6}
                    />
                </div>

                {/* MAIN DASHBOARD CONTENT */}
                <div className="transition-all duration-500">
                    {activeTab === 'soil' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <SoilSensorCard
                                moisture={sensorData.moisture.toFixed(0)}
                                status={statusText}
                            />
                            <RainSensorCard
                                isRaining={sensorData.rain > 50}
                                rainValue={sensorData.rain.toFixed(0)}
                                status={statusText}
                            />
                            <div className="md:col-span-2">
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
                        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="md:col-span-1 xl:col-span-1">
                                <ExpenseSummaryCard
                                    totalBalance={expenses.length > 0 ? `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}` : '$0'}
                                />
                            </div>
                            <RecentTransactionsMinimal transactions={expenses} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
