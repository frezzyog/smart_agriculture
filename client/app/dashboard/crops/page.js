'use client'

import React from 'react'
import { Sprout, Activity, TrendingUp, Scissors, Leaf, Droplets, Sun, Wind } from 'lucide-react'

export default function CropsPage() {
    const crops = [
        { id: 1, name: 'Lollo Rossa Lettuce', zone: 'Zone A', stage: 'Growth', progress: 65, health: 'Optimal', icon: Leaf, color: 'text-accent' },
        { id: 2, name: 'Bok Choy', zone: 'Zone B', stage: 'Seedling', progress: 30, health: 'Optimal', icon: Sprout, color: 'text-green-400' },
        { id: 3, name: 'Cherry Tomatoes', zone: 'Zone C', stage: 'Harvest Ready', progress: 100, health: 'Check Required', icon: Sun, color: 'text-yellow-400' },
    ]

    return (
        <div className="ml-64 p-10 min-h-screen bg-background text-white">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            Crop <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Management</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Monitor plant growth stages and biological health metrics.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-wider">
                            <Activity size={18} />
                            Health Scan
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-accent text-[#020603] rounded-2xl font-bold shadow-[0_10px_30_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                            <Scissors size={18} />
                            Plan Harvest
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {crops.map((crop) => (
                        <div key={crop.id} className="bg-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-[80px] opacity-10 -mr-10 -mt-10 group-hover:opacity-20 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-4 rounded-2xl bg-white/5 ${crop.color}`}>
                                    <crop.icon size={28} />
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${crop.health === 'Optimal' ? 'bg-accent/10 text-accent' : 'bg-yellow-400/10 text-yellow-400'}`}>
                                    {crop.health}
                                </span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white tracking-tight">{crop.name}</h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">{crop.zone} • {crop.stage}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <span>Growth Progress</span>
                                    <span className="text-white">{crop.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all duration-1000"
                                        style={{ width: `${crop.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
                                {[
                                    { icon: Sun, val: '8h' },
                                    { icon: Droplets, val: '65%' },
                                    { icon: Wind, val: '2m/s' }
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 group/stat">
                                        <stat.icon size={16} className="text-gray-600 group-hover/stat:text-accent transition-colors" />
                                        <span className="text-[10px] font-bold text-white">{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-card p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-10">
                    <div className="shrink-0 p-8 bg-accent/10 rounded-[2rem] border border-accent/20">
                        <TrendingUp size={48} className="text-accent" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2">Predicted Yield: 450kg</h3>
                        <p className="text-gray-400 leading-relaxed max-w-xl">
                            Based on current growth rates and environmental history, your total yield for this cycle is expected to exceed the seasonal average by 12%.
                            We recommend starting nitrogen enrichment in Zone B to maintain this momentum.
                        </p>
                    </div>
                    <button className="md:ml-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    )
}
