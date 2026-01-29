'use client'

import React, { useState, useEffect } from 'react'
import { Bell, User, Calendar, Circle, Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useSidebar } from '@/context/SidebarContext'

const Header = () => {
    const [currentTime, setCurrentTime] = useState('')
    const { toggle } = useSidebar()

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-xl sticky top-0 z-40 lg:ml-64 border-b border-border transition-all duration-500">
            <div className="flex items-center gap-4 md:gap-8">
                <button
                    onClick={toggle}
                    className="p-2 hover:bg-accent/10 rounded-xl lg:hidden text-foreground/60 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="hidden sm:flex items-center gap-2">
                    <Circle size={8} className="fill-accent text-accent animate-pulse" />
                    <span className="text-sm font-bold text-foreground tracking-wide">Online</span>
                </div>

                <div className="hidden sm:block h-4 w-px bg-border"></div>

                <div className="text-sm font-medium text-foreground/60">
                    <span className="hidden xs:inline">Local Time: </span>
                    <span className="text-foreground ml-1">{currentTime}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                    <Calendar size={18} />
                    <span className="text-sm font-bold tracking-tight">Days to Harvest: 14</span>
                </div>

                <ThemeToggle />

                <button className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>

                <button className="hidden sm:flex w-10 h-10 bg-card border border-border rounded-xl items-center justify-center text-foreground hover:bg-accent/10 transition-colors">
                    <User size={20} />
                </button>
            </div>
        </header>
    )
}

export default Header
