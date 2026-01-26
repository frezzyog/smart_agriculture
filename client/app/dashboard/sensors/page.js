'use client'

import React from 'react'
import { Wifi, Plus, Signal, Battery, Activity } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'

export default function sensorsPage() {
    const sensorData = useRealtimeSensorData()

    const sensors = [
        {
            id: 'S01',
            name: 'Soil Moisture A1',
            type: 'Moisture',
            value: sensorData.moisture.toFixed(1) + '%',
            status: sensorData.connected ? 'online' : 'offline',
            signal: 'Strong',
            battery: '85%'
        },
        {
            id: 'S02',
            name: 'Rain Detector',
            type: 'Environment',
            value: sensorData.rain > 50 ? 'Raining' : 'Clear',
            status: sensorData.connected ? 'online' : 'offline',
            signal: 'Medium',
            battery: '92%'
        },
        {
            id: 'S03',
            name: 'NPK Analyzer',
            type: 'Nutrients',
            value: 'Optimal',
            status: sensorData.connected ? 'online' : 'offline',
            signal: 'Strong',
            battery: '78%'
        },
        {
            id: 'S04',
            name: 'Temp/Humidity',
            type: 'Climate',
            value: '28°C / 65%',
            status: 'online',
            signal: 'Strong',
            battery: '100%'
        }
    ]

    return (
        <div className="ml-64 p-10 min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-4">
                            IOT Sensor Network
                            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-full border border-accent/20">
                                {sensors.filter(s => s.status === 'online').length} Active Nodes
                            </span>
                        </h1>
                        <p className="text-gray-500 font-medium">Manage and monitor your precision agriculture sensor array.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-accent text-[#020603] rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                        <Plus size={18} />
                        Register New Node
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sensors.map((sensor) => (
                        <div key={sensor.id} className="bg-card rounded-[2.5rem] p-8 border border-white/5 relative group hover:bg-white/[0.02] transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-4 rounded-2xl ${sensor.status === 'online' ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
                                    <Wifi size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-2 bg-white/5 rounded-lg text-gray-500">
                                        <Signal size={14} />
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg text-gray-500">
                                        <Battery size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sensor.id} • {sensor.type}</span>
                                <h3 className="text-xl font-bold text-white mt-1">{sensor.name}</h3>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-black text-white tracking-tighter">{sensor.value}</div>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${sensor.status === 'online' ? 'text-accent' : 'text-red-500'}`}>
                                        {sensor.status}
                                    </div>
                                </div>
                                <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-accent hover:text-[#020603] transition-all">
                                    <Activity size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
