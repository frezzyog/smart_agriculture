'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { X } from 'lucide-react'

const Sidebar = () => {
    const { alerts } = useAIInsights()
    const pathname = usePathname()
    const { isOpen, close } = useSidebar()
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
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(21,255,113,0.3)]">
                            <Leaf size={24} className="text-background" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">កសិកម្ម 4.0</h1>
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
                            key={item.label}
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
                <div className="mt-8 space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">System Load</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent w-2/3 rounded-full shadow-[0_0_10px_rgba(21,255,113,0.5)]"></div>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/settings"
                        onClick={() => { if (window.innerWidth < 1024) close() }}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-accent rounded-2xl text-background font-bold text-sm shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Settings size={18} />
                        Settings
                    </Link>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
