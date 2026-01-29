'use client'

import React, { useState, useEffect } from 'react'
import { Droplets, Beaker, Circle, AlertCircle } from 'lucide-react'
import { Switch } from '@headlessui/react'
import { controlPump } from '@/lib/api'

const PumpControl = ({ deviceId = 'SMARTAG-001' }) => {
    const [waterPump, setWaterPump] = useState(false)
    const [fertilizerPump, setFertilizerPump] = useState(false)
    const [isUpdating, setIsUpdating] = useState(null) // 'WATER' or 'FERTILIZER'
    const [error, setError] = useState(null)

    const handleToggle = async (type, currentStatus, setStatus) => {
        setIsUpdating(type)
        setError(null)
        const nextStatus = !currentStatus ? 'ON' : 'OFF'

        try {
            await controlPump(deviceId, {
                status: nextStatus,
                type: type, // WATER or FERTILIZER
                duration: 300 // default 5 mins if turning ON
            })
            setStatus(!currentStatus)
        } catch (err) {
            console.error(`Failed to control ${type} pump:`, err)
            setError(`Failed to toggle ${type.toLowerCase()} pump`)
            setTimeout(() => setError(null), 3000)
        } finally {
            setIsUpdating(null)
        }
    }

    const ToggleRow = ({ label, type, enabled, setEnabled }) => (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-border transition-all hover:bg-foreground/10 group">
            <div className="flex items-center gap-4">
                <Circle
                    size={8}
                    className={`${enabled ? 'fill-accent text-accent animate-pulse shadow-[0_0_8px_rgba(21,255,113,0.5)]' : 'fill-foreground/20 text-foreground/20'}`}
                />
                <h4 className="text-sm font-bold text-foreground tracking-tight">{label}</h4>
            </div>

            <div className="flex items-center gap-3">
                {isUpdating === type && (
                    <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                )}
                <Switch
                    checked={enabled}
                    onChange={() => handleToggle(type, enabled, setEnabled)}
                    disabled={!!isUpdating}
                    className={`${enabled ? 'bg-accent' : 'bg-foreground/10'} 
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                    <span
                        aria-hidden="true"
                        className={`${enabled ? 'translate-x-5' : 'translate-x-0'} 
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </Switch>
            </div>
        </div>
    )

    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-border h-full relative overflow-hidden">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-2 z-10 animate-bounce">
                    <AlertCircle size={10} /> {error}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">System Control</h3>
                    <p className="text-foreground/50 text-sm font-medium mt-1">Dual-Pump Architecture</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${waterPump || fertilizerPump ? 'bg-accent/20' : 'bg-foreground/10'}`}>
                    <div className={`absolute right-1 top-1 w-3 h-3 rounded-full transition-all ${waterPump || fertilizerPump ? 'bg-accent animate-pulse' : 'bg-foreground/20'}`}></div>
                </div>
            </div>

            <div className="space-y-4">
                <ToggleRow
                    label="Water Irrigation"
                    type="WATER"
                    enabled={waterPump}
                    setEnabled={setWaterPump}
                />
                <ToggleRow
                    label="Fertilizer Injection"
                    type="FERTILIZER"
                    enabled={fertilizerPump}
                    setEnabled={setFertilizerPump}
                />
            </div>

            <div className="mt-6 flex items-center justify-between px-2 opacity-40">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Hydraulic Relays</span>
                <span className="text-[10px] font-bold text-foreground/40">v2.1 Stable</span>
            </div>
        </div>
    )
}

export default PumpControl
