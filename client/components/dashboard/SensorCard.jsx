'use client'

import React from 'react'

const SensorCard = ({ title, subtitle, moisture, ec, status, icon: Icon }) => {
    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">{subtitle}</p>
                </div>
                <div className="text-accent flex items-center justify-center bg-accent/10 p-2.5 rounded-xl border border-accent/20">
                    <Icon size={22} />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-between mb-10">
                <div className="text-center">
                    <div className="text-5xl font-black text-accent tracking-tighter mb-1">{moisture}%</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Moisture</div>
                </div>

                <div className="h-12 w-px bg-white/10 mx-4"></div>

                <div className="text-center">
                    <div className="text-4xl font-black text-white tracking-tighter mb-1">{ec}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">EC (mS/cm)</div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</span>
                <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">{status}</span>
            </div>
        </div>
    )
}

export default SensorCard
