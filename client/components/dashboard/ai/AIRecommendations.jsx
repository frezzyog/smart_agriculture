'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Sparkles, ArrowRight, Lightbulb, ThermometerSun, Droplet } from 'lucide-react'

const AIRecommendations = () => {
    const recommendations = [
        {
            icon: Droplet,
            title: 'Irrigation Timing',
            description: 'Optimal window tomorrow: 06:15 AM to 07:00 AM.',
            impact: 'High',
            color: 'text-accent'
        },
        {
            icon: ThermometerSun,
            title: 'Heat Protection',
            description: 'UV intensity peak at 1 PM. Activate misting system.',
            impact: 'Medium',
            color: 'text-yellow-500'
        },
        {
            icon: Lightbulb,
            title: 'NPK Balance',
            description: 'Nitrogen uptake slowing. Consider low-dose top dressing.',
            impact: 'Low',
            color: 'text-blue-500'
        }
    ]

    return (
        <Card className="p-6 bg-card border-border relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-all duration-700"></div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <Sparkles size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">Smart Recommendations</h3>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-foreground/5 rounded-2xl border border-border hover:border-accent/30 transition-all group/item">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 ${rec.color}`}>
                                <rec.icon size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-foreground">{rec.title}</h4>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${rec.impact === 'High' ? 'text-red-500' :
                                        rec.impact === 'Medium' ? 'text-yellow-500' :
                                            'text-blue-500'
                                        }`}>
                                        Impact: {rec.impact}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground/40 group-hover/item:text-foreground/60 transition-all">{rec.description}</p>
                            </div>
                            <button className="self-center p-2 text-foreground/40 hover:text-foreground transition-all opacity-0 group-hover/item:opacity-100">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button className="w-full py-3 bg-foreground/5 rounded-xl text-xs font-bold text-foreground/40 hover:text-foreground hover:bg-foreground/10 border border-border transition-all text-center">
                    View Full Optimization Strategy
                </button>
            </div>
        </Card>
    )
}

export default AIRecommendations
