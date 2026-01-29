'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10 rounded-xl bg-card/50"></div>
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-accent/10 transition-all duration-300 group"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className="group-hover:rotate-45 transition-transform" />
            ) : (
                <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
            )}
        </button>
    )
}

export default ThemeToggle
