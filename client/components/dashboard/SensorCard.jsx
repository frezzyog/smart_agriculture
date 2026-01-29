'use client'

import React from 'react'

const SensorCard = ({ title, subtitle, moisture, ec, pH, status, icon: Icon }) => {
    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-border flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">{title}</h3>
                    <p className="text-foreground/40 text-sm font-medium mt-1">{subtitle}</p>
                </div>
                <div className="text-accent flex items-center justify-center bg-accent/10 p-2.5 rounded-xl border border-accent/20">
                    <Icon size={22} />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-between mb-8 md:mb-10 gap-2">
                <div className="text-center flex-1 min-w-0">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-accent tracking-tighter mb-1 truncate">{moisture}%</div>
                    <div className="text-[8px] md:text-[9px] font-bold text-foreground/40 uppercase tracking-[0.1em]">Moisture</div>
                </div>

                <div className="h-10 w-px bg-border shrink-0"></div>

                <div className="text-center flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter mb-1 truncate">{ec}</div>
                    <div className="text-[8px] md:text-[9px] font-bold text-foreground/40 uppercase tracking-[0.1em]">EC (mS)</div>
                </div>

                <div className="h-10 w-px bg-border shrink-0"></div>

                <div className="text-center flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter mb-1 truncate">{pH}</div>
                    <div className="text-[8px] md:text-[9px] font-bold text-foreground/40 uppercase tracking-[0.1em]">pH Level</div>
                </div>
            </div>

            <div className="mt-auto pt-4 md:pt-6 border-t border-border flex flex-col xs:flex-row justify-between items-center gap-2">
                <span className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center xs:text-left">System Status</span>
                <span className={`text-[9px] md:text-[10px] font-bold px-3 py-1 bg-accent/10 rounded-full whitespace-nowrap ${status?.includes('Live') ? 'text-accent' : 'text-yellow-500'}`}>
                    {status}
                </span>
            </div>
        </div>
    )
}

export default SensorCard
