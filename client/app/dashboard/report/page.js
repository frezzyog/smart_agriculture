'use client'

import React, { useState } from 'react'
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
    BarChart3
} from 'lucide-react'
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

const npkData = [
    { name: 'N', value: 40 },
    { name: 'P', value: 80 },
    { name: 'K', value: 45 },
]

const waterData = [
    { name: 'MON', actual: 400, target: 500 },
    { name: 'TUE', actual: 420, target: 500 },
    { name: 'WED', actual: 380, target: 500 },
    { name: 'THU', actual: 450, target: 500 },
    { name: 'FRI', actual: 480, target: 500 },
    { name: 'SAT', actual: 510, target: 500 },
    { name: 'SUN', actual: 490, target: 500 },
]

export default function ReportBuilderPage() {
    const [frequency, setFrequency] = useState('Weekly')
    const [emails, setEmails] = useState(['marcus@field.io'])
    const [emailInput, setEmailInput] = useState('')

    const addEmail = (e) => {
        if (e.key === 'Enter' && emailInput.trim()) {
            setEmails([...emails, emailInput.trim()])
            setEmailInput('')
        }
    }

    const removeEmail = (email) => {
        setEmails(emails.filter(e => e !== email))
    }

    return (
        <div className="ml-64 flex flex-col min-h-screen bg-background text-white">
            {/* Top Toolbar */}
            <header className="h-20 border-b border-white/5 bg-sidebar/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight">Custom Report Builder</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">
                        <Save size={16} />
                        Save Template
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-accent text-[#020603] rounded-xl text-xs font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all">
                        <Download size={16} />
                        Export as PDF/CSV
                    </button>
                    <div className="h-8 w-px bg-white/10 mx-2"></div>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <Bell size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Config & Widgets */}
                <aside className="w-[400px] border-r border-white/5 bg-sidebar/30 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-10">
                        {/* Report Config */}
                        <section>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Report Config</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-3">REPORT FREQUENCY</label>
                                    <div className="flex bg-white/5 p-1 rounded-xl">
                                        {['Daily', 'Weekly', 'Monthly'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFrequency(f)}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${frequency === f ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-3">RECIPIENT EMAILS</label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                onKeyDown={addEmail}
                                                placeholder="e.g. m.field@កសិកម្ម-4.0.io"
                                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-medium placeholder-gray-600 focus:outline-none focus:border-accent/40"
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
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Data Widgets</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Average NPK Levels', icon: Sprout, color: 'text-accent' },
                                    { label: 'Water vs. Target', icon: Droplets, color: 'text-blue-400' },
                                    { label: 'Solar Efficiency ROI', icon: Zap, color: 'text-yellow-400' },
                                    { label: 'Yield Quality', icon: LayoutGrid, color: 'text-purple-400' }
                                ].map((w, i) => (
                                    <div key={i} className="bg-card p-5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-grab active:cursor-grabbing hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 bg-white/5 rounded-lg ${w.color}`}>
                                                <w.icon size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-300">{w.label}</span>
                                        </div>
                                        <GripVertical size={16} className="text-gray-600 group-hover:text-gray-400" />
                                    </div>
                                ))}
                                <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 hover:border-white/20 transition-all">
                                    + Add New Widget
                                </button>
                            </div>
                        </section>
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 bg-background/50 overflow-y-auto p-12 custom-scrollbar flex justify-center">
                    <div className="w-full max-w-[900px]">
                        {/* Report Paper */}
                        <div className="bg-card border border-white/5 rounded-[2.5rem] p-16 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>

                            {/* Paper Header */}
                            <div className="flex justify-between items-start mb-16 relative z-10">
                                <div>
                                    <h2 className="text-5xl font-black tracking-tighter mb-4">Weekly Crop Analysis</h2>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                        REPORT ID: GS-2023-1102 <Circle size={4} className="fill-gray-700 text-gray-700" /> កសិកម្ម 4.0 FARMS - SECTOR A
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-accent mb-1 uppercase tracking-widest">Generated: Oct 24, 2026</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Report Period: Oct 17 - 23</div>
                                </div>
                            </div>

                            {/* Dashboard Widgets in Preview */}
                            <div className="grid grid-cols-2 gap-10 mb-10">
                                {/* Yield Quality Slot */}
                                <div className="p-8 border border-dashed border-white/10 rounded-[2rem] relative">
                                    <div className="absolute -top-3 left-6 px-2 bg-card text-[10px] font-bold text-gray-600 uppercase tracking-widest">WIDGET SLOT 01</div>
                                    <div className="flex justify-between items-start mb-8">
                                        <h3 className="text-xl font-bold">Yield Quality <br />Distribution</h3>
                                        <button className="text-gray-600 hover:text-white"><Info size={16} /></button>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="relative w-32 h-32">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="64" cy="64" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                                <circle cx="64" cy="64" r="50" fill="transparent" stroke="#15ff71" strokeWidth="12" strokeDasharray="314" strokeDashoffset="38" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black">88%</span>
                                                <span className="text-[8px] font-black text-gray-500 uppercase">Quality</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-3 bg-accent rounded-full"></div>
                                                <div>
                                                    <div className="text-xs font-bold">Grade A:</div>
                                                    <div className="text-[10px] text-gray-500 font-bold">2,400 units</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-3 bg-white/10 rounded-full"></div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-400">Grade B:</div>
                                                    <div className="text-[10px] text-gray-500 font-bold">320 units</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Solar ROI Slot */}
                                <div className="p-8 border border-dashed border-white/10 rounded-[2rem] relative">
                                    <div className="absolute -top-3 left-6 px-2 bg-card text-[10px] font-bold text-gray-600 uppercase tracking-widest">WIDGET SLOT 02</div>
                                    <div className="flex justify-between items-start mb-8">
                                        <h3 className="text-xl font-bold">Solar Efficiency ROI</h3>
                                        <button className="text-gray-600 hover:text-white"><Info size={16} /></button>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-500">Energy Generated</span>
                                            <span className="text-xl font-black">1,240 <span className="text-xs font-bold text-gray-500 ml-1 uppercase">kWh</span></span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-500">Cost Savings</span>
                                            <span className="text-xl font-black text-accent">$412.00</span>
                                        </div>
                                        <div className="h-px bg-white/5"></div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-500">System Uptime</span>
                                            <span className="text-xl font-black text-blue-400">99.2%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Chart Slot */}
                            <div className="p-8 border border-dashed border-white/10 rounded-[2rem] relative">
                                <div className="absolute -top-3 left-6 px-2 bg-card text-[10px] font-bold text-gray-600 uppercase tracking-widest">WIDGET SLOT 03 (HERO)</div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black mb-1">Water Consumption vs. Target</h3>
                                        <p className="text-[10px] font-bold text-gray-500">Cumulative weekly usage tracked via SmartFlow sensors</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actual</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-white/10"></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={waterData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(21,255,113,0.05)' }}
                                                contentStyle={{ backgroundColor: '#020603', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            />
                                            <Bar dataKey="target" fill="rgba(255,255,255,0.05)" radius={[10, 10, 10, 10]} />
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
