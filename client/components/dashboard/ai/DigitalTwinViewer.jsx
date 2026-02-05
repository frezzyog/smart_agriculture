'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Map, Layers, Target, TreePine, Droplets, AlertTriangle } from 'lucide-react'

import { useTranslation } from 'react-i18next'

const DigitalTwinViewer = ({ zoneId, data }) => {
    const { t } = useTranslation()
    const layout = data?.layout || [
        { id: 1, x: 20, y: 30, type: 'CROP', health: 90 },
        { id: 2, x: 50, y: 50, type: 'SENSOR', health: 100 },
        { id: 3, x: 80, y: 30, type: 'CROP', health: 85 },
        { id: 4, x: 20, y: 70, type: 'CROP', health: 45 }, // Stressed crop
        { id: 5, x: 80, y: 70, type: 'DRY_ZONE', health: 20 }, // Critical zone
    ]

    return (
        <Card className="p-6 bg-card border-border relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('status.digital_twin')}</h3>
                    <p className="text-[10px] text-foreground/40">{t('status.spatial_analysis')}: {zoneId || t('status.select_zone')}</p>
                </div>
            </div>

            <div className="aspect-[4/3] bg-foreground/5 rounded-2xl border border-dashed border-border relative overflow-hidden">
                {/* Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                    {[...Array(36)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-border"></div>
                    ))}
                </div>

                {/* Live Data Points */}
                {layout.map((item, i) => (
                    <div
                        key={i}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 cursor-help group/item"
                        style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    >
                        <div className={`p-2 rounded-lg ${item.health > 80 ? 'bg-accent/20 text-accent border-accent/40' :
                            item.health > 50 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40' :
                                'bg-red-500/20 text-red-500 border-red-500/40'
                            } border shadow-lg`}>
                            {item.type === 'CROP' && <TreePine size={16} />}
                            {item.type === 'SENSOR' && <Target size={16} />}
                            {item.type === 'DRY_ZONE' && <AlertTriangle size={16} className="animate-pulse" />}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/item:block z-50">
                            <div className="bg-card border border-border p-2 rounded-lg text-[9px] whitespace-nowrap shadow-2xl">
                                <p className="text-foreground font-bold">{item.type}</p>
                                <p className="text-accent">Health: {item.health}%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex gap-4">
                    <span className="text-[9px] text-foreground/40 font-bold uppercase flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> {t('status.excellent')}
                    </span>
                    <span className="text-[9px] text-foreground/40 font-bold uppercase flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> {t('ai_insights_page.active_monitoring')}
                    </span>
                    <span className="text-[9px] text-foreground/40 font-bold uppercase flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {t('dashboard.critical')}
                    </span>
                </div>
            </div>
        </Card>
    )
}

export default DigitalTwinViewer
