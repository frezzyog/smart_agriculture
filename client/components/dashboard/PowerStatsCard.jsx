'use client'

import React from 'react'
import { Zap } from 'lucide-react'

const PowerStatsCard = ({ percentage, voltage, charging, runtime }) => {
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Power Stats</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Array B - Lithium Unit</p>
                </div>
                <div className="text-yellow-400 flex items-center justify-center bg-yellow-400/10 p-2.5 rounded-xl border border-yellow-400/20">
                    <Zap size={22} fill="currentColor" />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center gap-8 mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="10"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            fill="transparent"
                            stroke="#15ff71"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">{percentage}%</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="text-3xl font-black text-white tracking-tighter">{voltage} <span className="text-lg text-gray-500 font-bold uppercase ml-1">Volts</span></div>
                        {charging && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-widest mt-1">
                                <Zap size={10} fill="currentColor" />
                                Solar Charging
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Est. Runtime</span>
                <span className="text-xs font-bold text-white tracking-tight">{runtime}</span>
            </div>
        </div>
    )
}

export default PowerStatsCard
