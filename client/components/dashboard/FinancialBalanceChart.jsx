'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FinancialBalanceChart = ({ transactions }) => {
    const { t } = useTranslation()

    // Process transactions
    const income = transactions
        .filter(t => t.category === 'Income' || t.category === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const expensesList = transactions
        .filter(t => t.category !== 'Income' && t.category !== 'income')

    const totalExpenses = expensesList.reduce((sum, t) => sum + t.amount, 0)

    // Group expenses by category
    const categoryTotals = expensesList.reduce((acc, curr) => {
        const cat = curr.category || 'Other'
        acc[cat] = (acc[cat] || 0) + curr.amount
        return acc
    }, {})

    const data = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        amount: categoryTotals[cat]
    })).sort((a, b) => b.amount - a.amount)

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl h-[400px] flex flex-col relative overflow-hidden group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 shrink-0">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.financial_analytics')}</h3>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{t('dashboard.expense_breakdown')}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-foreground/60">Income</span>
                        </div>
                        <span className="text-sm font-black text-emerald-500">${income.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                            <TrendingDown size={14} className="text-red-500" />
                            <span className="text-xs font-bold text-foreground/60">Expenses</span>
                        </div>
                        <span className="text-sm font-black text-red-500">${totalExpenses.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full relative z-10">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-foreground/5" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'currentColor', fontWeight: 600 }}
                                className="text-foreground/70"
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-card backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl">
                                                <p className="text-xs font-bold text-foreground/40 mb-1 uppercase tracking-wider">{payload[0].payload.name}</p>
                                                <p className="text-xl font-black text-foreground">${payload[0].value.toLocaleString()}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-foreground/20 font-bold uppercase tracking-widest text-sm">
                        No financial data available
                    </div>
                )}
            </div>
        </div>
    )
}

export default FinancialBalanceChart
