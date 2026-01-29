'use client'

import React from 'react'
import { DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const ExpenseSummaryCard = ({ totalBalance = '$12,450', monthlySpend = '$455', projectedROI = '24%' }) => {
    const cards = [
        { label: 'Total Balance', val: totalBalance, sub: '+12% from last month', icon: DollarSign, col: 'text-accent' },
        { label: 'Monthly Spend', val: monthlySpend, sub: 'Calculated this month', icon: ArrowUpRight, col: 'text-red-400' },
        { label: 'Projected ROI', val: projectedROI, sub: 'Based on current yield', icon: ArrowDownLeft, col: 'text-blue-400' }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <div key={i} className="bg-card p-6 rounded-[2rem] border border-white/5 shadow-lg backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-white/5 ${card.col}`}>
                            <card.icon size={20} />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${card.col}`}>{card.label}</span>
                    </div>
                    <div className="text-3xl font-black mb-1">{card.val}</div>
                    <p className="text-[10px] text-gray-500 font-medium">{card.sub}</p>
                </div>
            ))}
        </div>
    )
}

export default ExpenseSummaryCard
