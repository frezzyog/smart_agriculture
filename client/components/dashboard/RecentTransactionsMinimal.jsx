'use client'

import React from 'react'
import Link from 'next/link'
import { Receipt, Sprout, ShoppingCart, Wrench, DollarSign } from 'lucide-react'

const RecentTransactionsMinimal = ({ transactions = [] }) => {
    // Default mock data if none provided
    const displayTransactions = transactions.length > 0 ? transactions.slice(0, 4) : [
        { id: 1, title: 'Premium Fertilizer', category: 'Supplies', amount: -250.00, icon: Sprout, color: 'text-green-400' },
        { id: 2, title: 'Bulk Water Supply', category: 'Utility', amount: -120.00, icon: ShoppingCart, color: 'text-blue-400' },
        { id: 3, title: 'Pump Maintenance', category: 'Repairs', amount: -85.00, icon: Wrench, color: 'text-yellow-400' },
        { id: 4, title: 'Government Grant', category: 'Income', amount: 1500.00, icon: DollarSign, color: 'text-accent' },
    ].slice(0, 4)

    return (
        <div className="bg-card rounded-[2rem] border border-border overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Receipt size={16} className="text-accent" />
                    Recent Transactions
                </h3>
                <Link
                    href="/dashboard/expenses"
                    className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest hover:text-foreground transition-colors"
                >
                    View All
                </Link>
            </div>
            <div className="divide-y divide-border flex-1 overflow-auto">
                {displayTransactions.map((t) => {
                    const Icon = t.icon || Receipt
                    return (
                        <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 bg-foreground/5 rounded-xl ${t.color || 'text-foreground/40'}`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs truncate max-w-[120px] text-foreground">{t.title}</h4>
                                    <p className="text-[10px] text-foreground/40 font-medium">{t.category}</p>
                                </div>
                            </div>
                            <div className={`text-sm font-black tracking-tight ${t.amount > 0 ? 'text-accent' : 'text-foreground'}`}>
                                {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(0)}
                            </div>
                        </div>
                    )
                })}
                {displayTransactions.length === 0 && (
                    <div className="p-10 text-center text-foreground/40 text-xs font-medium">
                        No recent transactions found.
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecentTransactionsMinimal
