'use client'

import React, { useState, useEffect } from 'react'
import SensorCard from '@/components/dashboard/SensorCard'
import PowerStatsCard from '@/components/dashboard/PowerStatsCard'
import PumpControl from '@/components/dashboard/PumpControl'
import NPKTrendChart from '@/components/dashboard/NPKTrendChart'
import RecentAlerts from '@/components/dashboard/RecentAlerts'
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard'
import RecentTransactionsMinimal from '@/components/dashboard/RecentTransactionsMinimal'
import { Droplet } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'
import { getExpenses } from '@/lib/api'

export default function DashboardPage() {
    const sensorData = useRealtimeSensorData()
    const [expenses, setExpenses] = useState([])

    useEffect(() => {
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
                {/* Top Row: KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <SensorCard
                        title="Soil Analytics"
                        subtitle="7-in-1 Advanced Monitor"
                        moisture={sensorData.moisture.toFixed(0)}
                        ec={sensorData.ec.toFixed(1)}
                        pH={sensorData.pH.toFixed(1)}
                        status={sensorData.connected ? "Live Data" : "Connecting..."}
                        icon={Droplet}
                    />
                    <PowerStatsCard
                        percentage={85}
                        voltage={12.8}
                        charging={true}
                        runtime="48h 12m"
                    />
                    <PumpControl deviceId={sensorData.deviceId || 'SMARTAG-001'} />
                </div>

                {/* Second Row: Expenses Summary & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ExpenseSummaryCard
                            totalBalance={expenses.length > 0 ? `$${expenses.reduce((sum, e) => sum + e.amount, 12450).toLocaleString()}` : '$12,450'}
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
