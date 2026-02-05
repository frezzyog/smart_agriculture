'use client'

import React from 'react'
import { Wifi, Plus, Signal, Battery, Activity, Edit, Trash2 } from 'lucide-react'
import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData'
import { useTranslation } from 'react-i18next'

export default function sensorsPage() {
    const { t } = useTranslation()
    const sensorData = useRealtimeSensorData()

    const [sensors, setSensors] = React.useState([
        {
            id: 'S01',
            name: 'Soil Moisture A1',
            type: 'Moisture', // Using simple string keys or t() inside, but keeping initial simple
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
    ])

    // Update dynamic values from sensorData for existing sensors
    React.useEffect(() => {
        setSensors(prev => prev.map(s => {
            if (s.id === 'S01') return { ...s, value: sensorData.moisture.toFixed(1) + '%', status: sensorData.connected ? 'online' : 'offline' }
            if (s.id === 'S02') return { ...s, value: sensorData.rain > 50 ? 'Raining' : 'Clear', status: sensorData.connected ? 'online' : 'offline' }
            if (s.id === 'S03') return { ...s, status: sensorData.connected ? 'online' : 'offline' }
            return s
        }))
    }, [sensorData])

    const handleRegister = () => {
        const id = window.prompt(t('sensors.register_node') + ' (ID):', 'S0' + (sensors.length + 1))
        if (id) {
            const newSensor = {
                id: id,
                name: 'New Sensor Device',
                type: 'Generic',
                value: 'Initializing...',
                status: 'online',
                signal: 'Strong',
                battery: '100%'
            }
            setSensors([...sensors, newSensor])
        }
    }

    const handleEdit = (id, currentName) => {
        const newName = window.prompt('Rename Device:', currentName)
        if (newName) {
            setSensors(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s))
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            setSensors(prev => prev.filter(s => s.id !== id))
        }
    }

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background transition-all duration-500">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-2 flex flex-wrap items-center gap-4">
                            {t('sensors.title')}
                            <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full border border-accent/20">
                                {sensors.filter(s => s.status === 'online').length} {t('sensors.active_nodes')}
                            </span>
                        </h1>
                        <p className="text-sm md:text-base text-foreground/50 font-medium">{t('sensors.description')}</p>
                    </div>
                    <button
                        onClick={handleRegister}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background rounded-2xl font-bold shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                        <Plus size={18} />
                        {t('sensors.register_node')}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sensors.map((sensor) => (
                        <div key={sensor.id} className="bg-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-border relative group hover:bg-foreground/[0.02] transition-all">
                            {/* Action Buttons Overlay - Top Right */}
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(sensor.id, sensor.name) }}
                                    className="p-2 bg-foreground/10 text-foreground hover:bg-accent hover:text-background rounded-full transition-colors shadow-sm"
                                    title="Edit Device"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(sensor.id) }}
                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors shadow-sm"
                                    title="Delete Device"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-6 md:mb-8">
                                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${sensor.status === 'online' ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
                                    <Wifi size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div className="flex gap-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                    <div className="p-2 bg-foreground/5 rounded-lg text-foreground/40">
                                        <Signal size={14} />
                                    </div>
                                    <div className="p-2 bg-foreground/5 rounded-lg text-foreground/40">
                                        <Battery size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 md:mb-8">
                                <span className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{sensor.id} • {t(`sensors.types.${sensor.type.toLowerCase()}`) || sensor.type}</span>
                                <h3 className="text-lg md:text-xl font-bold text-foreground mt-1 truncate">{sensor.name}</h3>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">{sensor.value}</div>
                                    <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1 ${sensor.status === 'online' ? 'text-accent' : 'text-red-500'}`}>
                                        {t(`sensors.${sensor.status}`)}
                                    </div>
                                </div>
                                <button className="w-9 h-9 md:w-10 md:h-10 bg-foreground/5 rounded-xl flex items-center justify-center text-foreground hover:bg-accent hover:text-background transition-all">
                                    <Activity size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
