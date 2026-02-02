'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Save,
    Download,
    Bell,
    Droplets,
    Zap,
    Sprout,
    LayoutGrid,
    GripVertical,
    X,
    Plus,
    Circle,
    Info,
    Calendar,
    BarChart3,
    Search,
    Loader2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line
} from 'recharts'
import { generateDashboardReport } from '@/lib/reportGenerator'

export default function ReportBuilderPage() {
    const { t } = useTranslation()
    const [frequency, setFrequency] = useState('Weekly')
    const [emails, setEmails] = useState(['marcus@field.io'])
    const [emailInput, setEmailInput] = useState('')

    // Data states
    const [loading, setLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [devices, setDevices] = useState([])
    const [selectedDeviceId, setSelectedDeviceId] = useState('')
    const [sensorHistory, setSensorHistory] = useState([])
    const [expenses, setExpenses] = useState([])
    const [aiPredictions, setAiPredictions] = useState([])

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (selectedDeviceId) {
            fetchDeviceData(selectedDeviceId)
        }
    }, [selectedDeviceId])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            // 1. Fetch devices
            const devicesRes = await fetch(`${apiUrl}/api/devices`)
            const devicesData = await devicesRes.json().catch(() => ({}))

            if (Array.isArray(devicesData) && devicesData.length > 0) {
                setDevices(devicesData)
                setSelectedDeviceId(devicesData[0].deviceId || devicesData[0].device_id || devicesData[0].id)
            } else {
                console.warn('⚠️ No devices found or invalid format, using dummy device')
                const dummyDevices = [{ deviceId: 'DEMO-001', name: 'Demo Rice Field', status: 'ACTIVE' }]
                setDevices(dummyDevices)
                setSelectedDeviceId(dummyDevices[0].deviceId)
            }

            // 2. Fetch expenses
            const expensesRes = await fetch(`${apiUrl}/api/expenses`)
            const expensesData = await expensesRes.json().catch(() => [])
            setExpenses(Array.isArray(expensesData) ? expensesData : [])
        } catch (error) {
            console.error('Error fetching report data:', error)
            setDevices([{ deviceId: 'DEMO-001', name: 'Demo Rice Field', status: 'ACTIVE' }])
            setSelectedDeviceId('DEMO-001')
            setExpenses([])
        } finally {
            setLoading(false)
        }
    }

    const fetchDeviceData = async (deviceId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            // Fetch sensor history
            const sensorRes = await fetch(`${apiUrl}/api/sensors/${deviceId}?limit=50`)
            const sensorData = await sensorRes.json()
            setSensorHistory(Array.isArray(sensorData) ? sensorData : [])

            // Try to find zone or use a default for predictions
            // For now, we'll try to fetch predictions if available
            const predRes = await fetch(`${apiUrl}/api/ai/predictions/default-zone`)
            if (predRes.ok) {
                const predData = await predRes.json()
                setAiPredictions(Array.isArray(predData) ? predData : [])
            }
        } catch (error) {
            console.error('Error fetching device specific data:', error)
            setSensorHistory([])
        }
    }

    // Process data for charts
    const waterData = useMemo(() => {
        if (!sensorHistory.length) return [
            { name: 'MON', actual: 0, target: 500 },
            { name: 'TUE', actual: 0, target: 500 },
            { name: 'WED', actual: 0, target: 500 },
            { name: 'THU', actual: 0, target: 500 },
            { name: 'FRI', actual: 0, target: 500 },
            { name: 'SAT', actual: 0, target: 500 },
            { name: 'SUN', actual: 0, target: 500 },
        ]

        // Group by day of week (simplistic mapping for demo)
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        const last7 = sensorHistory.slice(0, 7).reverse()

        return last7.map((d, i) => {
            const date = new Date(d.timestamp)
            return {
                name: days[date.getDay()],
                actual: Math.round(d.moisture * 5), // Scale for visual
                target: 500
            }
        })
    }, [sensorHistory])

    const npkData = useMemo(() => {
        if (!sensorHistory.length) return [{ name: 'N', value: 0 }, { name: 'P', value: 0 }, { name: 'K', value: 0 }]
        const latest = sensorHistory[0]
        return [
            { name: 'N', value: latest.nitrogen || 40 },
            { name: 'P', value: latest.phosphorus || 80 },
            { name: 'K', value: latest.potassium || 45 },
        ]
    }, [sensorHistory])

    const summaryStats = useMemo(() => {
        const latest = sensorHistory[0] || {}
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

        return {
            soilHealth: latest.soilHealth || 'N/A',
            stressLevel: latest.stressLevel || 0,
            avgMoisture: sensorHistory.length > 0
                ? (sensorHistory.reduce((s, h) => s + (h.moisture || 0), 0) / sensorHistory.length).toFixed(1)
                : '0',
            totalSpent: totalExpense.toFixed(2)
        }
    }, [sensorHistory, expenses])

    const addEmail = (e) => {
        if (e.key === 'Enter' && emailInput.trim()) {
            setEmails([...emails, emailInput.trim()])
            setEmailInput('')
        }
    }

    const removeEmail = (email) => {
        setEmails(emails.filter(e => e !== email))
    }

    const handleExport = async () => {
        try {
            setIsExporting(true)
            // Small delay for UX feel
            await new Promise(r => setTimeout(r, 800))

            generateDashboardReport(
                currentDeviceName,
                sensorHistory,
                expenses,
                aiPredictions,
                frequency
            )
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const currentDeviceName = devices.find(d => d.deviceId === selectedDeviceId)?.name || 'Unknown Device'

    if (loading) {
        return (
            <div className="lg:ml-64 flex items-center justify-center min-h-screen bg-background transition-all duration-500">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('report_page.loading')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="lg:ml-64 flex flex-col min-h-screen bg-background text-foreground transition-all duration-500">
            {/* Top Toolbar */}
            <header className="min-h-20 py-4 border-b border-border bg-sidebar/50 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between px-6 md:px-10 sticky top-0 z-40 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-center sm:text-left">{t('report_page.title')}</h1>
                    <div className="hidden sm:block h-6 w-px bg-foreground/10 mx-2"></div>
                    <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-lg border border-border w-full sm:w-auto">
                        <Search size={14} className="text-foreground/40 shrink-0" />
                        <select
                            value={selectedDeviceId}
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="bg-transparent text-[10px] md:text-xs font-bold focus:outline-none cursor-pointer w-full"
                        >
                            {devices.map(d => (
                                <option key={d.deviceId} value={d.deviceId} className="bg-sidebar">
                                    {d.name} ({d.deviceId})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-end">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-[10px] md:text-xs font-bold transition-all">
                        <Save size={14} className="md:w-4 md:h-4" />
                        <span className="hidden xs:inline">{t('report_page.save_template')}</span>
                        <span className="xs:hidden">{t('report_page.save')}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-accent text-[#020603] rounded-xl text-[10px] md:text-xs font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> : <Download size={14} className="md:w-4 md:h-4" />}
                        {isExporting ? t('report_page.wait') : t('report_page.export')}
                    </button>
                    <div className="hidden sm:block h-8 w-px bg-foreground/10 mx-2"></div>
                    <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors shrink-0">
                        <Bell size={18} className="md:w-5 md:h-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row flex-1 overflow-visible lg:overflow-hidden">
                {/* Configuration Panel */}
                <aside className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-border bg-sidebar/30 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-10">
                        {/* Report Config */}
                        <section>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-6">{t('report_page.config')}</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-foreground/40 block mb-3">{t('report_page.frequency').toUpperCase()}</label>
                                    <div className="flex bg-foreground/5 p-1 rounded-xl">
                                        {['Daily', 'Weekly', 'Monthly'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFrequency(f)}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${frequency === f ? 'bg-foreground/10 text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/60'}`}
                                            >
                                                {t(`report_page.${f.toLowerCase()}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-foreground/40 block mb-3">{t('report_page.recipients').toUpperCase()}</label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                onKeyDown={addEmail}
                                                placeholder="e.g. farmer@កសិកម្ម-4.0.io"
                                                className="w-full h-12 bg-foreground/5 border border-border rounded-xl px-4 text-xs font-medium placeholder-foreground/20 focus:outline-none focus:border-accent/40"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {emails.map(email => (
                                                <span key={email} className="bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-2">
                                                    {email}
                                                    <button onClick={() => removeEmail(email)}><X size={10} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Data Widgets */}
                        <section>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-6">{t('report_page.available_data')}</h2>
                            <div className="space-y-4">
                                {[
                                    { label: t('report_page.soil_health_info'), value: summaryStats.soilHealth, icon: Sprout, color: 'text-accent' },
                                    { label: t('report_page.avg_moisture'), value: `${summaryStats.avgMoisture}%`, icon: Droplets, color: 'text-blue-400' },
                                    { label: t('report_page.stress_level'), value: `${summaryStats.stressLevel}%`, icon: Zap, color: 'text-yellow-400' },
                                    { label: t('report_page.total_expenses'), value: `$${summaryStats.totalSpent}`, icon: LayoutGrid, color: 'text-purple-400' }
                                ].map((w, i) => (
                                    <div key={i} className="bg-card p-5 rounded-2xl border border-border flex items-center justify-between group hover:bg-foreground/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 bg-foreground/5 rounded-lg ${w.color}`}>
                                                <w.icon size={18} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-foreground/40 block uppercase tracking-tighter">{w.label}</span>
                                                <span className="text-sm font-black text-foreground">{w.value}</span>
                                            </div>
                                        </div>
                                        <GripVertical size={16} className="text-gray-600 group-hover:text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 bg-background/50 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar flex justify-center">
                    <div className="w-full max-w-[900px]">
                        {/* Report Paper */}
                        <div className="bg-card border border-border rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] p-6 md:p-10 lg:p-16 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>

                            {/* Paper Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-10 md:mb-16 relative z-10 gap-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-foreground leading-none">{t(`report_page.${frequency.toLowerCase()}`)} {t('report_page.crop_analysis')}</h2>
                                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[9px] md:text-xs flex items-center flex-wrap gap-2">
                                        {t('report_page.report_id').toUpperCase()}: GS-{selectedDeviceId.split('-')[0]}-{Date.now().toString().slice(-4)}
                                        <Circle size={4} className="fill-foreground/20 text-foreground/20 hidden sm:block" />
                                        {currentDeviceName} - AREA 01
                                    </p>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                                    <div className="text-[10px] md:text-sm font-black text-accent mb-1 uppercase tracking-widest">{t('report_page.generated')}: {new Date().toLocaleDateString()}</div>
                                    <div className="text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('report_page.status')}: {sensorHistory.length > 0 ? t('report_page.active') : t('report_page.no_data')}</div>
                                </div>
                            </div>

                            {/* Dashboard Widgets in Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-6 md:mb-10">
                                {/* Yield Quality Slot (Now AI Stress) */}
                                <div className="p-6 md:p-8 border border-dashed border-border rounded-[1.5rem] md:rounded-[2rem] relative">
                                    <div className="absolute -top-3 left-6 px-2 bg-card text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('ai_insights_page.title').toUpperCase()}</div>
                                    <div className="flex justify-between items-start mb-6 md:mb-8">
                                        <h3 className="text-lg md:text-xl font-bold text-foreground">{t('report_page.crop_stress_dist')}</h3>
                                        <button className="text-foreground/40 hover:text-foreground"><Info size={16} /></button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row lg:flex-row items-center gap-6 md:gap-8">
                                        <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" className="text-foreground/5" strokeWidth="12" />
                                                <circle cx="64" cy="64" r="50" fill="transparent" stroke={summaryStats.stressLevel > 50 ? "#ef4444" : "#15ff71"} strokeWidth="12" strokeDasharray="314" strokeDashoffset={314 - (314 * (100 - summaryStats.stressLevel)) / 100} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black text-foreground">{100 - summaryStats.stressLevel}%</span>
                                                <span className="text-[8px] font-black text-foreground/40 uppercase">{t('report_page.health_label')}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-3 bg-accent rounded-full"></div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground">{t('report_page.soil_condition')}:</div>
                                                    <div className="text-[10px] text-foreground/40 font-bold uppercase">{summaryStats.soilHealth}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-3 bg-blue-500 rounded-full"></div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground/40">{t('report_page.avg_moisture')}:</div>
                                                    <div className="text-[10px] text-foreground/40 font-bold">{summaryStats.avgMoisture}% ({t('report_page.avg_label')})</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seasonal Expenses */}
                                <div className="p-6 md:p-8 border border-dashed border-border rounded-[1.5rem] md:rounded-[2rem] relative">
                                    <div className="absolute -top-3 left-6 px-2 bg-card text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('report_page.financial_summary').toUpperCase()}</div>
                                    <div className="flex justify-between items-start mb-6 md:mb-8">
                                        <h3 className="text-lg md:text-xl font-bold text-foreground">{t('report_page.recent_expenses')}</h3>
                                        <button className="text-foreground/40 hover:text-foreground"><Info size={16} /></button>
                                    </div>
                                    <div className="space-y-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                                        {expenses.length > 0 ? expenses.slice(0, 4).map((exp, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-foreground/5 p-3 rounded-xl border border-border">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-foreground truncate">{exp.title}</div>
                                                    <div className="text-[9px] text-foreground/40 uppercase font-black">{t(`expenses_page.categories.${exp.category.toLowerCase()}`)}</div>
                                                </div>
                                                <div className="text-xs md:text-sm font-black text-accent ml-2 shrink-0">${exp.amount}</div>
                                            </div>
                                        )) : (
                                            <p className="text-center text-foreground/20 text-[9px] md:text-[10px] font-bold py-10">{t('report_page.no_expense_data')}</p>
                                        )}
                                    </div>
                                    {expenses.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-end">
                                            <span className="text-[9px] md:text-xs font-bold text-foreground/40 uppercase">{t('report_page.total_spent')}</span>
                                            <span className="text-lg md:text-xl font-black text-foreground">${summaryStats.totalSpent}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hero Chart Slot */}
                            <div className="p-6 md:p-8 border border-dashed border-border rounded-[1.5rem] md:rounded-[2rem] relative">
                                <div className="absolute -top-3 left-6 px-2 bg-card text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('report_page.moisture_trend_target')}</div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black mb-1 text-foreground">{t('report_page.weekly_moisture')}</h3>
                                        <p className="text-[9px] md:text-[10px] font-bold text-foreground/40">{t('report_page.history_tracked')}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                                            <span className="text-[8px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t('report_page.actual')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-foreground/10"></div>
                                            <span className="text-[8px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t('report_page.target')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[200px] md:h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={waterData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-foreground/5" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                                                className="text-foreground/40"
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: 'currentColor', className: 'text-foreground/5' }}
                                                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                                                itemStyle={{ color: 'var(--foreground)' }}
                                                labelStyle={{ color: 'var(--foreground)' }}
                                            />
                                            <Bar dataKey="target" fill="currentColor" className="text-foreground/5" radius={[10, 10, 10, 10]} />
                                            <Bar dataKey="actual" fill="#15ff71" radius={[10, 10, 10, 10]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
