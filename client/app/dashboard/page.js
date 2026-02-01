'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import SensorCard from '@/components/dashboard/SensorCard'
import PowerStatsCard from '@/components/dashboard/PowerStatsCard'
import PumpControl from '@/components/dashboard/PumpControl'
import NPKTrendChart from '@/components/dashboard/NPKTrendChart'
import RecentAlerts from '@/components/dashboard/RecentAlerts'
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard'
import RecentTransactionsMinimal from '@/components/dashboard/RecentTransactionsMinimal'
import WeatherCard from '@/components/dashboard/WeatherCard'
import { Droplet } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'
import { getExpenses } from '@/lib/api'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
    const { t } = useTranslation()
    const sensorData = useRealtimeSensorData()
    const [expenses, setExpenses] = React.useState([])

    React.useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await getExpenses()
                setExpenses(data)
            } catch (error) {
                console.error('Error fetching expenses:', error)
            }
        }
        fetchExpenses()
    }, [])

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background transition-all duration-500">
            <div className="max-w-[1600px] mx-auto space-y-10">
                {/* Top Row: KPIs + Weather */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    <SensorCard
                        title={t('dashboard.soil_analytics')}
                        subtitle={t('dashboard.advanced_monitor')}
                        moisture={sensorData.moisture.toFixed(0)}
                        ec={sensorData.ec.toFixed(1)}
                        pH={sensorData.pH.toFixed(1)}
                        status={sensorData.connected ? t('dashboard.live_data') : t('dashboard.connecting')}
                        icon={Droplet}
                    />
                    <PowerStatsCard
                        percentage={Math.round(sensorData.battery ?? 85)}
                        voltage={parseFloat(sensorData.voltage ?? 12.8).toFixed(1)}
                        charging={sensorData.voltage > 12.6}
                        runtime="48h 12m"
                    />
                    <WeatherCard />
                </div>

                {/* Second Row: Expenses Summary & Recent Transactions */}
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

                {/* Middle Row: Trend Chart */}
                <div className="grid grid-cols-1">
                    <NPKTrendChart />
                </div>

                {/* Bottom Row: Alerts */}
                <RecentAlerts />
            </div>
        </div>
    )
}
