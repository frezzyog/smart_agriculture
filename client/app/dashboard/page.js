'use client'

import React, { useState, useEffect } from 'react'
import SensorCard from '@/components/dashboard/SensorCard'
import PowerStatsCard from '@/components/dashboard/PowerStatsCard'
import PumpControl from '@/components/dashboard/PumpControl'
import NPKTrendChart from '@/components/dashboard/NPKTrendChart'
import RecentAlerts from '@/components/dashboard/RecentAlerts'
import { Droplet } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'

export default function DashboardPage() {
    const sensorData = useRealtimeSensorData()

    return (
        <div className="ml-64 p-10 min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto space-y-10">
                {/* Top Row: KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <SensorCard
                        title="Soil Health"
                        subtitle="Sector 01 - Zone A"
                        moisture={sensorData.moisture.toFixed(0)}
                        ec="1.2"
                        status="Optimal Range"
                        icon={Droplet}
                    />
                    <PowerStatsCard
                        percentage={85}
                        voltage={12.8}
                        charging={true}
                        runtime="48h 12m"
                    />
                    <PumpControl />
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
