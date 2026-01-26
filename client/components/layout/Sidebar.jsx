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
    Leaf
} from 'lucide-react'

import { useAIInsights } from '@/hooks/useAIInsights'

const Sidebar = () => {
    const { alerts } = useAIInsights()
    const pathname = usePathname()
    const unreadCount = alerts.data?.filter(a => !a.isRead).length || 0

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { label: 'IOT Sensor', href: '/dashboard/sensors', icon: Wifi },
        { label: 'Expenses', href: '/dashboard/expenses', icon: BarChart3 },
        { label: 'Crop Management', href: '/dashboard/crops', icon: Sprout, subtitle: 'Yield & Tracking' },
        { label: 'Planning', href: '/dashboard/planning', icon: Calendar },
        { label: 'Irrigation Logs', href: '/dashboard/irrigation', icon: Droplets },
        { label: 'AI Insights', href: '/dashboard/ai-insights', icon: BarChart3, subtitle: 'Predictions & Analysis' },
        { label: 'Farmer Guide', href: '/dashboard/guide', icon: BookOpen },
        { label: 'Report', href: '/dashboard/report', icon: FileText },
        { label: 'AI Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
    ]

    return (
        <aside className="w-64 bg-sidebar h-screen py-8 px-6 flex flex-col fixed left-0 top-0 z-50 border-r border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(21,255,113,0.3)]">
                    <Leaf size={24} className="text-[#020603]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white leading-none">កសិកម្ម 4.0</h1>
                    <p className="text-[10px] text-accent font-medium mt-1">Precision Ag IoT</p>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${pathname === item.href
                            ? 'bg-accent/10 border border-accent/20 text-accent shadow-[inset_0_0_10px_rgba(21,255,113,0.05)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon size={20} className={pathname === item.href ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold block">{item.label}</span>
                                {item.label === 'AI Insights' && unreadCount > 0 && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                                )}
                            </div>
                            {item.subtitle && <span className="text-[9px] opacity-60 block -mt-0.5">{item.subtitle}</span>}
                        </div>
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Load</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-2/3 rounded-full shadow-[0_0_10px_rgba(21,255,113,0.5)]"></div>
                    </div>
                </div>

                <Link
                    href="/dashboard/settings"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-accent rounded-2xl text-[#020603] font-bold text-sm shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Settings size={18} />
                    Settings
                </Link>
            </div>
        </aside>
    )
}

export default Sidebar
