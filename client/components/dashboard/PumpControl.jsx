'use client'

import React, { useState } from 'react'
import { Droplets, Beaker, Circle } from 'lucide-react'
import { Switch } from '@headlessui/react'

const PumpControl = () => {
    const [waterPump, setWaterPump] = useState(true)
    const [nutrientPump, setNutrientPump] = useState(true)

    const ToggleRow = ({ label, icon: Icon, enabled, setEnabled }) => (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group">
            <div className="flex items-center gap-4">
                <Circle size={8} className={`${enabled ? 'fill-accent text-accent' : 'fill-gray-600 text-gray-600'}`} />
                <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
            </div>

            <Switch
                checked={enabled}
                onChange={setEnabled}
                className={`${enabled ? 'bg-accent' : 'bg-white/10'
                    } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
                <span
                    aria-hidden="true"
                    className={`${enabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </Switch>
        </div>
    )

    return (
        <div className="bg-card rounded-[2.5rem] p-8 border border-white/5 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Pump Control</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Direct Hydraulic Relay</p>
                </div>
                <div className="w-10 h-5 bg-white/10 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-gray-500 rounded-full"></div>
                </div>
            </div>

            <div className="space-y-4">
                <ToggleRow
                    label="Nutrient Pump"
                    enabled={nutrientPump}
                    setEnabled={setNutrientPump}
                />
                <ToggleRow
                    label="Water Pump"
                    enabled={waterPump}
                    setEnabled={setWaterPump}
                />
            </div>
        </div>
    )
}

export default PumpControl
