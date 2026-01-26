'use client'

import React from 'react'
import { Droplets, Thermometer, Wind } from 'lucide-react'

const DigitalTwinMap = () => {
    const zones = [
        { id: 'A', name: 'West Orchard', status: 'watered', health: 92, x: '10%', y: '10%', w: '40%', h: '35%' },
        { id: 'B', name: 'Central Field', status: 'optimal', health: 88, x: '55%', y: '10%', w: '35%', h: '80%' },
        { id: 'C', name: 'South Nursery', status: 'nutrient-low', health: 65, x: '10%', y: '50%', w: '40%', h: '40%' },
    ]

    const getStatusStyles = (status) => {
        switch (status) {
            case 'watered': return 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            case 'nutrient-low': return 'bg-orange-500/20 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
            default: return 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
        }
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Digital Twin Map</h3>
                    <p className="text-xs text-gray-500 mt-1">Real-time spatial health visualization</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                        <Droplets size={12} /> Live
                    </span>
                </div>
            </div>

            <div className="relative aspect-video bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                {/* Map Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                {/* Zones */}
                {zones.map((zone) => (
                    <div
                        key={zone.id}
                        className={`absolute border-2 rounded-xl transition-all duration-500 cursor-pointer group hover:z-10 ${getStatusStyles(zone.status)}`}
                        style={{ top: zone.y, left: zone.x, width: zone.w, height: zone.h }}
                    >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center transition-opacity group-hover:bg-white/10">
                            <span className="text-lg font-black text-gray-900/40 group-hover:text-gray-900/60 transition-colors">ZONE {zone.id}</span>
                            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] font-bold text-gray-800">{zone.name}</p>
                                <div className="mt-1 h-1 w-12 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                    <div className={`h-full ${zone.health > 80 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${zone.health}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Status Pulse */}
                        <div className="absolute top-2 right-2 flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${zone.status === 'watered' ? 'bg-blue-400' : zone.status === 'nutrient-low' ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${zone.status === 'watered' ? 'bg-blue-500' : zone.status === 'nutrient-low' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                        </div>
                    </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 flex gap-4 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-semibold text-gray-600">Recently Watered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-[10px] font-semibold text-gray-600">Low Nutrients</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-semibold text-gray-600">Optimal</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DigitalTwinMap
