'use client'

import React from 'react'
import { BookOpen, Search, Play, Book, Lightbulb, ChefHat, HeartPulse, Microscope, ArrowRight, Droplets, Bug, Cpu, Atom, Sprout } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function GuidePage() {
    const { t } = useTranslation()

    const guides = [
        { id: 5, title: t('guide.lettuce_title'), category: t('guide.farming_cat'), time: `15 ${t('guide.min_read')}`, icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-400/10', slug: 'lettuce' },
        { id: 1, title: t('guide.npk_title'), category: t('guide.nutrients_cat'), time: `12 ${t('guide.min_read')}`, icon: Microscope, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 2, title: t('guide.pest_title'), category: t('guide.protection_cat'), time: `8 ${t('guide.min_read')}`, icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-400/10' },
        { id: 3, title: t('guide.hydro_title'), category: t('guide.setup_cat'), time: `15 ${t('guide.min_read')}`, icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { id: 4, title: t('guide.storage_title'), category: t('guide.harvest_cat'), time: `10 ${t('guide.min_read')}`, icon: ChefHat, color: 'text-green-400', bg: 'bg-green-400/10' },
    ]

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background text-foreground transition-all duration-500">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-2 flex items-center gap-3">
                            {t('guide.title')} <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">{t('guide.subtitle')}</span>
                        </h1>
                        <p className="text-sm md:text-base text-foreground/50 font-medium">{t('guide.description')}</p>
                    </div>
                </div>

                <div className="relative mb-12">
                    <input
                        type="text"
                        placeholder={t('guide.search_placeholder')}
                        className="w-full h-16 pl-16 pr-8 bg-foreground/5 border border-border rounded-[2rem] text-foreground placeholder-foreground/30 focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/30" size={24} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {guides.map((guide) => (
                        <Link key={guide.id} href={guide.slug ? `/dashboard/guide/${guide.slug}` : '#'}>
                            <div className="h-full bg-card p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border hover:bg-foreground/[0.02] hover:scale-[1.02] transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 md:p-4 rounded-xl ${guide.bg} ${guide.color}`}>
                                        <guide.icon size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <span className="text-[8px] md:text-[10px] font-black text-foreground/30 uppercase tracking-widest">{guide.time}</span>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors leading-snug">{guide.title}</h3>
                                <p className="text-[9px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{guide.category}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
