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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight drop-shadow-sm flex items-center gap-3">
                            <span className="text-accent underline decoration-4 decoration-accent/30 underline-offset-8">Soil Data</span>
                            <span className="text-foreground/30 font-thin">/</span>
                            <span>Balance</span>
                        </h1>
                        <p className="text-foreground/40 font-medium mt-3 flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            {t('dashboard.overview_motto', 'Comprehensive Farm & Finance Intelligence')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

                    {/* LEFT COLUMN: SOIL DATA (2/3 width on desktop) */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                <Sprout size={20} className="animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Soil Data</h2>
                        </div>

                        {/* Top boxes: Weather & Power Stat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <WeatherCard />
                            <PowerStatsCard
                                percentage={Math.round(sensorData.battery ?? 85)}
                                voltage={parseFloat(sensorData.voltage ?? 12.8).toFixed(1)}
                                charging={sensorData.voltage > 12.6}
                                runtime="48h 12m"
                            />
                        </div>

                        {/* Sensor boxes under weather/power */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SoilSensorCard
                                    moisture={sensorData.moisture.toFixed(0)}
                                    status={statusText}
                                />
                                <RainSensorCard
                                    isRaining={sensorData.rain > 50} // Assuming threshold
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

                    {/* RIGHT COLUMN: BALANCE (1/3 width on desktop) */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                <Wallet size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Balance</h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <ExpenseSummaryCard
                                totalBalance={expenses.length > 0 ? `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}` : '$0'}
                            />
                            <RecentTransactionsMinimal transactions={expenses} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
