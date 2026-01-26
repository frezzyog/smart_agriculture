'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Map, Layers, Target, Activity } from 'lucide-react'
import { useAIInsights } from '@/hooks/useAIInsights'

const ZoneHealthMap = () => {
    const { zones, isLoading } = useAIInsights('main-zone')

    // For this project, we focus on the primary field
    const mainZone = zones.data?.[0] || { id: 'main-zone', name: 'Main Field', status: 'optimal', health: 'Optimal', moisture: 68 }

    return (
        <Card className="p-6 bg-[#0a0f0b] border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Field Health Map</h3>
                    <p className="text-[10px] text-gray-500">Real-time sector analysis</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-2 py-1 bg-accent/10 border border-accent/20 rounded-md flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[9px] font-bold text-accent uppercase">Active</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {/* Large Visual Representation of the Single Zone */}
                <div className="relative flex-1 bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden group cursor-crosshair">
                    {/* Grid Background Effect */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full h-full border-2 border-dashed border-accent/20 rounded-2xl flex flex-col items-center justify-center relative bg-accent/5">
                            {/* Central Status Icon */}
                            <div className="relative">
                                <Activity size={48} className="text-accent/40" />
                                <div className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-[#0a0f0b]"></div>
                            </div>
                            <div className="text-center mt-4">
                                <h4 className="text-2xl font-black text-white">{mainZone.moisture}%</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Avg. Soil Moisture</p>
                            </div>

                            {/* Floating Data Points for visual flair */}
                            <div className="absolute top-4 left-4 p-2 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-[8px] font-bold text-gray-400">SECTOR A-1</p>
                                <p className="text-[10px] font-bold text-accent">72%</p>
                            </div>
                            <div className="absolute bottom-4 right-4 p-2 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-[8px] font-bold text-gray-400">SECTOR B-4</p>
                                <p className="text-[10px] font-bold text-accent">64%</p>
                            </div>
                        </div>
                    </div>

                    {/* Hover Info */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#020603]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold text-white whitespace-nowrap">
                        Primary Agricultural Zone: {mainZone.status.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Area</p>
                        <p className="text-sm font-bold text-white mt-1">2.4 Hectares</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Crop Type</p>
                        <p className="text-sm font-bold text-white mt-1">Rice / Paddy</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent"></div> Healthy
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Caution
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Critical
                </span>
            </div>
        </Card>
    )
}

export default ZoneHealthMap
