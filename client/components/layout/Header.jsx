'use client'

import React, { useState, useEffect } from 'react'
import { Bell, User, Calendar, Circle } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Header = () => {
    const [currentTime, setCurrentTime] = useState('')

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
        <header className="h-20 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl sticky top-0 z-40 ml-64 border-b border-border">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <Circle size={8} className="fill-accent text-accent animate-pulse" />
                    <span className="text-sm font-bold text-foreground tracking-wide">Online</span>
                </div>

                <div className="h-4 w-px bg-border"></div>

                <div className="text-sm font-medium text-foreground/60">
                    Local Time: <span className="text-foreground ml-1">{currentTime}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                    <Calendar size={18} />
                    <span className="text-sm font-bold tracking-tight">Days to Harvest: 14</span>
                </div>

                <ThemeToggle />

                <button className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>

                <button className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors">
                    <User size={20} />
                </button>
            </div>
        </header>
    )
}

export default Header
