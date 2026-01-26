'use client'

import React from 'react'
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, Receipt, ShoppingCart, Wrench, Sprout } from 'lucide-react'

export default function ExpensesPage() {
    const transactions = [
        { id: 1, title: 'Premium Fertilizer', category: 'Supplies', amount: -250.00, date: 'Jan 24, 2026', icon: Sprout, color: 'text-green-400' },
        { id: 2, title: 'Bulk Water Supply', category: 'Utility', amount: -120.00, date: 'Jan 22, 2026', icon: ShoppingCart, color: 'text-blue-400' },
        { id: 3, title: 'Pump Maintenance', category: 'Repairs', amount: -85.00, date: 'Jan 15, 2026', icon: Wrench, color: 'text-yellow-400' },
        { id: 4, title: 'Government Grant', category: 'Income', amount: 1500.00, date: 'Jan 10, 2026', icon: DollarSign, color: 'text-accent' },
    ]

    return (
        <div className="ml-64 p-10 min-h-screen bg-background text-white">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            Farm <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Expenses</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Track your agricultural investments and ROI.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-accent text-[#020603] rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                        <Plus size={18} />
                        Add Transaction
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {[
                        { label: 'Total Balance', val: '$12,450', sub: '+12% from last month', icon: DollarSign, col: 'text-accent' },
                        { label: 'Monthly Spend', val: '$455', sub: 'Calculated this month', icon: ArrowUpRight, col: 'text-red-400' },
                        { label: 'Projected ROI', val: '24%', sub: 'Based on current yield', icon: ArrowDownLeft, col: 'text-blue-400' }
                    ].map((card, i) => (
                        <div key={i} className="bg-card p-8 rounded-[2.5rem] border border-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-white/5 ${card.col}`}>
                                    <card.icon size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${card.col}`}>{card.label}</span>
                            </div>
                            <div className="text-4xl font-black mb-2">{card.val}</div>
                            <p className="text-xs text-gray-500 font-medium">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Receipt size={20} className="text-accent" />
                            Recent Transactions
                        </h3>
                        <button className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {transactions.map((t) => (
                            <div key={t.id} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-white/5 rounded-2xl text-gray-400">
                                        <t.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{t.title}</h4>
                                        <p className="text-sm text-gray-500 font-medium">{t.category} • {t.date}</p>
                                    </div>
                                </div>
                                <div className={`text-xl font-black tracking-tight ${t.amount > 0 ? 'text-accent' : 'text-white'}`}>
                                    {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
