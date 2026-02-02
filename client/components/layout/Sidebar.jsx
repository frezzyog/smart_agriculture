'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutGrid,
    Wifi,
    BarChart3,
    Sprout,
    Calendar,
    Droplets,
    BookOpen,
    FileText,
    MessageSquare,
    Settings,
    Leaf,
    X,
    Languages
} from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { useAIInsights } from '@/hooks/useAIInsights'
import { useTranslation } from 'react-i18next'

const Sidebar = () => {
    const { t, i18n } = useTranslation()
    const { alerts } = useAIInsights()
    const pathname = usePathname()
    const { isOpen, close } = useSidebar()
    const unreadCount = alerts.data?.filter(a => !a.isRead).length || 0

    const navItems = [
        { label: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutGrid },
        { label: t('sidebar.iot_sensor'), href: '/dashboard/sensors', icon: Wifi },
        { label: t('sidebar.expenses'), href: '/dashboard/expenses', icon: BarChart3 },
        { label: t('sidebar.crop_management'), href: '/dashboard/crops', icon: Sprout, subtitle: t('sidebar.crop_management_sub') },
        { label: t('sidebar.planning'), href: '/dashboard/planning', icon: Calendar },
        { label: t('sidebar.irrigation_logs'), href: '/dashboard/irrigation', icon: Droplets },
        { label: t('sidebar.ai_insights'), href: '/dashboard/ai-insights', icon: BarChart3, subtitle: t('sidebar.ai_insights_sub') },
        { label: t('sidebar.farmer_guide'), href: '/dashboard/guide', icon: BookOpen },
        { label: t('sidebar.report'), href: '/dashboard/report', icon: FileText },
        { label: t('sidebar.ai_chatbot'), href: '/dashboard/chatbot', icon: MessageSquare },
    ]

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'km' : 'en'
        i18n.changeLanguage(newLang)
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                    onClick={close}
                />
            )}

            <aside className={`w-64 bg-sidebar h-screen py-8 px-6 flex flex-col fixed left-0 top-0 z-50 border-r border-border transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo & Close Button */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">{t('sidebar.title')}</h1>
                            <p className="text-[10px] text-accent font-medium mt-1">Precision Ag IoT</p>
                        </div>
                    </div>
                    <button onClick={close} className="lg:hidden text-foreground/40 hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => { if (window.innerWidth < 1024) close() }}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${pathname === item.href
                                ? 'bg-accent/10 border border-accent/20 text-accent shadow-[inset_0_0_10px_rgba(21,255,113,0.05)]'
                                : 'text-foreground/60 hover:text-foreground hover:bg-accent/10'
                                }`}
                        >
                            <item.icon size={20} className={pathname === item.href ? 'text-accent' : 'text-foreground/40 group-hover:text-foreground/60'} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold block">{item.label}</span>
                                    {item.label === t('sidebar.ai_insights') && unreadCount > 0 && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                                    )}
                                </div>
                                {item.subtitle && <span className="text-[9px] opacity-60 block -mt-0.5">{item.subtitle}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="mt-8 space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('sidebar.system_load')}</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent w-2/3 rounded-full shadow-[0_0_10px_rgba(21,255,113,0.5)]"></div>
                        </div>
                    </div>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-foreground/60 font-bold text-xs hover:bg-white/10 transition-all uppercase tracking-wider"
                    >
                        <Languages size={16} />
                        {i18n.language === 'en' ? 'English' : 'ភាសាខ្មែរ'}
                    </button>

                    <Link
                        href="/dashboard/settings"
                        onClick={() => { if (window.innerWidth < 1024) close() }}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-accent rounded-2xl text-background font-bold text-sm shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Settings size={18} />
                        {t('sidebar.settings')}
                    </Link>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
