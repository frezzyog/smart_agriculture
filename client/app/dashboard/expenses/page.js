'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, Receipt, ShoppingCart, Wrench, Sprout, Loader2 } from 'lucide-react'
import { getExpenses } from '@/lib/api'
import AddTransactionModal from '@/components/expenses/AddTransactionModal'
import { useTranslation } from 'react-i18next'

export default function ExpensesPage() {
    const { t } = useTranslation()
    const [expenses, setExpenses] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const data = await getExpenses()
            setExpenses(data)
        } catch (error) {
            console.error('Error fetching expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchExpenses()
    }, [])

    const getIcon = (category) => {
        switch (category) {
            case 'Supplies': return Sprout
            case 'Utility': return ShoppingCart
            case 'Repairs': return Wrench
            case 'Income': return DollarSign
            default: return Receipt
        }
    }

    const getColor = (category) => {
        switch (category) {
            case 'Supplies': return 'text-green-400'
            case 'Utility': return 'text-blue-400'
            case 'Repairs': return 'text-yellow-400'
            case 'Income': return 'text-accent'
            default: return 'text-gray-400'
        }
    }

    const expensesList = Array.isArray(expenses) ? expenses : []
    const totalBalance = expensesList.reduce((sum, e) => sum + (e.amount || 0), 12450)
    const monthlySpend = Math.abs(expensesList.filter(e => (e.amount || 0) < 0).reduce((sum, e) => sum + (e.amount || 0), 0))

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-2 flex items-center gap-3">
                            {t('expenses_page.title')} <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">{t('expenses_page.subtitle')}</span>
                        </h1>
                        <p className="text-sm md:text-base text-foreground/50 font-medium">{t('expenses_page.description')}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider"
                    >
                        <Plus size={18} />
                        {t('expenses_page.add_transaction')}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
                    {[
                        { label: t('expenses_page.total_balance'), val: `$${totalBalance.toLocaleString()}`, sub: `+12% ${t('expenses_page.from_last_month')}`, icon: DollarSign, col: 'text-accent' },
                        { label: t('expenses_page.monthly_spend'), val: `$${monthlySpend.toLocaleString()}`, sub: t('expenses_page.calculated_this_month'), icon: ArrowUpRight, col: 'text-red-400' },
                        { label: t('expenses_page.projected_roi'), val: '24%', sub: t('expenses_page.based_on_yield'), icon: ArrowDownLeft, col: 'text-blue-400' }
                    ].map((card, i) => (
                        <div key={i} className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border shadow-xl backdrop-blur-md">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-foreground/5 ${card.col}`}>
                                    <card.icon size={20} className="md:w-6 md:h-6" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${card.col}`}>{card.label}</span>
                            </div>
                            <div className="text-3xl md:text-4xl font-black mb-2 text-foreground">{card.val}</div>
                            <p className="text-xs text-foreground/50 font-medium">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
                            <Receipt size={20} className="text-accent" />
                            {t('expenses_page.recent_transactions')}
                        </h3>
                        <button className="text-xs font-bold text-foreground/40 uppercase tracking-widest hover:text-foreground transition-colors">{t('expenses_page.view_all')}</button>
                    </div>
                    <div className="divide-y divide-border">
                        {loading ? (
                            <div className="p-20 flex justify-center items-center">
                                <Loader2 className="animate-spin text-accent" size={40} />
                            </div>
                        ) : expensesList.length > 0 ? (
                            expensesList.map((expense) => {
                                const Icon = getIcon(expense.category)
                                return (
                                    <div key={expense.id} className="p-5 md:p-8 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors gap-4">
                                        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                                            <div className={`p-3 md:p-4 bg-foreground/5 rounded-xl md:rounded-2xl ${getColor(expense.category)} shrink-0`}>
                                                <Icon size={20} className="md:w-6 md:h-6" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-base md:text-lg text-foreground truncate">{expense.title || 'Untitled'}</h4>
                                                <p className="text-xs md:text-sm text-foreground/50 font-medium truncate">{t(`expenses_page.categories.${(expense.category || 'Other').toLowerCase()}`)} • {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className={`text-lg md:text-xl font-black tracking-tight shrink-0 ${expense.amount > 0 ? 'text-accent' : 'text-foreground'}`}>
                                            {expense.amount > 0 ? '+' : ''}${Math.abs(expense.amount).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-20 text-center text-foreground/50 font-medium">
                                {t('expenses_page.no_transactions')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchExpenses}
            />
        </div>
    )
}
