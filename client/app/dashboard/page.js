'use client'

import React, { useState, useEffect } from 'react'
import CompactWeatherCard from '@/components/dashboard/CompactWeatherCard'
import RainSensorCard from '@/components/dashboard/RainSensorCard'
import SoilSensorCard from '@/components/dashboard/SoilSensorCard'
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard'
import FertilizerMonitor from '@/components/dashboard/FertilizerMonitor'
import RecentTransactionsMinimal from '@/components/dashboard/RecentTransactionsMinimal'
import SensorHistoryChart from '@/components/dashboard/SensorHistoryChart'
import NPKTrendChart from '@/components/dashboard/NPKTrendChart'
import FinancialBalanceChart from '@/components/dashboard/FinancialBalanceChart'
import { Droplet, LayoutDashboard, Wallet, Sprout } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'
import { getExpenses, getSensorData, getDevices } from '@/lib/api'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const { t } = useTranslation()
    const { user, loading } = useAuth()
    const router = useRouter()
    const sensorData = useRealtimeSensorData()
    const [expenses, setExpenses] = useState([])
    const [historicalData, setHistoricalData] = useState([])
    const [activeTab, setActiveTab] = useState('soil') // 'soil' or 'balance'

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            try {
                // Fetch expenses (MOCKED DATA FOR PRESENTATION)
                // const expData = await getExpenses()
                const expData = [
                    { id: 1, category: 'Income', amount: 3500, date: '2024-02-01', description: 'Lettuce Harvest Sale' },
                    { id: 2, category: 'Supplies', amount: 450, date: '2024-02-02', description: 'Organic Fertilizer (20kg)' },
                    { id: 3, category: 'Utility', amount: 120, date: '2024-02-03', description: 'Irrigation Pump Electricity' },
                    { id: 4, category: 'Repairs', amount: 85, date: '2024-02-04', description: 'Sensor Maintenance' },
                    { id: 5, category: 'Income', amount: 1200, date: '2024-02-05', description: 'Local Market Delivery' },
                    { id: 6, category: 'Supplies', amount: 200, date: '2024-02-06', description: 'Seedlings' }
                ]
                setExpenses(expData)

                // Fetch historical sensor data (limit to 20 for charts)
                const devices = await getDevices()
                if (devices && devices.length > 0) {
                    const devId = devices[0].deviceId
                    const histData = await getSensorData(devId, { limit: 20 })

                    if (histData && Array.isArray(histData)) {
                        // Format for SensorHistoryChart
                        const formatted = histData.reverse().map(d => ({
                            time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            moisture: d.moisture,
                            rain: d.rain,
                            n: d.nitrogen,
                            p: d.phosphorus,
                            k: d.potassium
                        }))
                        setHistoricalData(formatted)
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            }
        }
        fetchData()
    }, [user])

    // Update historical data when new realtime data arrives (keep it fresh)
    useEffect(() => {
        if (sensorData.connected && sensorData.timestamp) {
            setHistoricalData(prev => {
                // Avoid duplicates if timestamp is same
                if (prev.length > 0 && prev[prev.length - 1].rawTimestamp === sensorData.timestamp) return prev;

                const newData = [...prev, {
                    time: new Date(sensorData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    moisture: sensorData.moisture,
                    rain: sensorData.rain,
                    n: sensorData.nitrogen,
                    p: sensorData.phosphorus,
                    k: sensorData.potassium,
                    rawTimestamp: sensorData.timestamp
                }]
                return newData.slice(-20) // Keep last 20
            })
        }
    }, [sensorData.timestamp, sensorData.connected])

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
                                className={`transition-all duration-300 ${activeTab === 'soil' ? 'text-accent underline decoration-4 decoration-accent/30 underline-offset-8' : 'text-foreground/60 hover:text-foreground'}`}
                            >
                                {t('dashboard.soil_data')}
                            </button>
                            <span className="text-foreground/20 font-thin">/</span>
                            <button
                                onClick={() => setActiveTab('balance')}
                                className={`transition-all duration-300 ${activeTab === 'balance' ? 'text-emerald-500 underline decoration-4 decoration-emerald-500/30 underline-offset-8' : 'text-foreground/60 hover:text-foreground'}`}
                            >
                                {t('dashboard.balance')}
                            </button>
                        </h1>
                        <p className="text-foreground/60 font-medium mt-3 flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            {activeTab === 'soil' ? t('dashboard.environmental_telemetry') : t('dashboard.financial_overview')}
                        </p>
                    </div>

                    {/* Compact Weather Forecast - Replaces Quick Toggle UI */}
                    <div className="flex-1 flex justify-end max-w-full lg:max-w-2xl">
                        <CompactWeatherCard />
                    </div>
                </div>

                {/* Removed Mini Status Bar as requested */}



                {/* MAIN DASHBOARD CONTENT */}
                <div className="transition-all duration-500">
                    {activeTab === 'soil' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Real-time Status Cards */}
                            <SoilSensorCard
                                moisture={sensorData.moisture.toFixed(0)}
                                status={statusText}
                            />
                            <RainSensorCard
                                isRaining={sensorData.rain > 50}
                                rainValue={sensorData.rain.toFixed(0)}
                                status={statusText}
                            />

                            {/* New Big Screen EC/Fertilizer Monitor */}
                            <div className="md:col-span-2">
                                <FertilizerMonitor
                                    nitrogen={sensorData.nitrogen}
                                    phosphorus={sensorData.phosphorus}
                                    potassium={sensorData.potassium}
                                    ec={sensorData.ec.toFixed(1)}
                                    ph={sensorData.pH.toFixed(1)}
                                    temp={sensorData.temp.toFixed(1)}
                                />
                            </div>

                            {/* Analytics Visualizations */}
                            <div className="md:col-span-1">
                                <SensorHistoryChart data={historicalData} />
                            </div>
                            <div className="md:col-span-1">
                                <NPKTrendChart data={historicalData.map(h => ({
                                    name: h.time,
                                    n: h.n,
                                    p: h.p,
                                    k: h.k
                                }))} />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col gap-8">
                                <ExpenseSummaryCard
                                    totalBalance={expenses.length > 0 ? `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}` : '$0'}
                                />
                                <FinancialBalanceChart transactions={expenses} />
                            </div>
                            <RecentTransactionsMinimal transactions={expenses} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
