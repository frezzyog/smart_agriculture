'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, User, Calendar, Circle, Menu, LogOut, Settings, CreditCard, Droplet, Thermometer, Wind } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const Typewriter = ({ textArray, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000 }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [loopNum, setLoopNum] = useState(0)

    useEffect(() => {
        let timer
        const i = loopNum % textArray.length
        const fullText = textArray[i]

        if (isDeleting) {
            timer = setTimeout(() => {
                setDisplayedText(fullText.substring(0, displayedText.length - 1))
            }, deletingSpeed)
        } else {
            timer = setTimeout(() => {
                setDisplayedText(fullText.substring(0, displayedText.length + 1))
            }, typingSpeed)
        }

        if (!isDeleting && displayedText === fullText) {
            clearTimeout(timer)
            timer = setTimeout(() => setIsDeleting(true), pauseTime)
        } else if (isDeleting && displayedText === '') {
            setIsDeleting(false)
            setLoopNum(loopNum + 1)
        }

        return () => clearTimeout(timer)
    }, [displayedText, isDeleting, loopNum, textArray, typingSpeed, deletingSpeed, pauseTime])

    return (
        <span className="font-mono text-accent">
            {displayedText}
            <span className="animate-pulse ml-1 opacity-70">_</span>
        </span>
    )
}

const Header = () => {
    const [currentTime, setCurrentTime] = useState('')
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const { toggle } = useSidebar()
    const { t } = useTranslation()
    const { user, signOut } = useAuth()
    const router = useRouter()

    const profileRef = useRef(null)
    const notificationsRef = useRef(null)

    const notifications = [
        { id: 1, title: 'Soil Moisture Low', msg: 'Zone A-1 needs watering', icon: Droplet, color: 'text-blue-500', time: '5m ago' },
        { id: 2, title: 'High Temperature', msg: 'Greenhouse 2 above 32°C', icon: Thermometer, color: 'text-orange-500', time: '15m ago' },
        { id: 3, title: 'Fertilizer Alert', msg: 'PH levels outside optimal range', icon: Wind, color: 'text-purple-500', time: '1h ago' }
    ]

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await signOut()
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleTestTelegram = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            const response = await fetch(`${apiUrl}/api/test-telegram`)

            if (response.ok) {
                alert('📱 Test Telegram alert sent! Please check your Telegram.')
                setIsProfileOpen(false)
            } else {
                const errorData = await response.json()
                alert(`❌ Telegram Test Failed: ${errorData.error || 'Unknown error'}`)
            }
        } catch (err) {
            console.error('Telegram Test error:', err)
            alert('❌ Network error connecting to backend.')
        }
    }

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
                    <span className="text-sm font-bold text-foreground tracking-wide">{t('header.online')}</span>
                </div>

                <div className="hidden sm:block h-4 w-px bg-border"></div>

                <div className="text-sm font-medium text-foreground/60">
                    <span className="hidden xs:inline">{t('header.local_time')}: </span>
                    <span className="text-foreground ml-1">{currentTime}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden md:flex items-center gap-3 px-5 py-2 bg-black/80 border border-accent/20 rounded-xl shadow-[inset_0_0_20px_rgba(21,255,113,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(21,255,113,0.8)]"></div>
                    <div className="text-sm font-bold tracking-wide text-accent font-mono min-w-[240px]">
                        <Typewriter textArray={["Welcome to Agriculture 4.0", "ស្វាគមន៏មកកាន់កសិកម្ម៤.០"]} />
                    </div>
                </div>

                <ThemeToggle />

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen)
                            setIsProfileOpen(false)
                        }}
                        className={`w-10 h-10 border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors relative ${isNotificationsOpen ? 'bg-accent/10 border-accent/30' : 'bg-card'}`}
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-3 duration-200">
                            <div className="p-3 border-b border-border mb-2 flex items-center justify-between">
                                <span className="font-bold text-sm">{t('header.notifications')}</span>
                                <span className="text-[10px] uppercase tracking-widest text-accent font-bold cursor-pointer hover:underline">{t('header.mark_all_read')}</span>
                            </div>
                            <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-3 hover:bg-foreground/5 rounded-xl transition-all cursor-pointer group">
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 ${n.color}`}>
                                                <n.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="font-bold text-xs truncate">{n.title}</h4>
                                                    <span className="text-[10px] text-foreground/30 font-medium">{n.time}</span>
                                                </div>
                                                <p className="text-xs text-foreground/50 line-clamp-1">{n.msg}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 p-2 pt-0">
                                <button className="w-full py-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-colors">
                                    {t('header.view_all_activity')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => {
                            setIsProfileOpen(!isProfileOpen)
                            setIsNotificationsOpen(false)
                        }}
                        className={`w-10 h-10 border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors ${isProfileOpen ? 'bg-accent/10 border-accent/30' : 'bg-card'}`}
                    >
                        <User size={20} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-3 duration-200">
                            <div className="p-4 border-b border-border mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                        {user?.email?.[0].toUpperCase() || 'F'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{user?.email?.split('@')[0] || t('header.farmer')}</h4>
                                        <p className="text-[10px] text-foreground/40 truncate">{user?.email || 'farmer@smartag.com'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-xl transition-all group">
                                    <User size={18} className="text-foreground/40 group-hover:text-green-500 transition-colors" />
                                    <span className="text-sm font-bold text-foreground/70 group-hover:text-foreground">{t('header.my_profile')}</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-xl transition-all group">
                                    <Settings size={18} className="text-foreground/40 group-hover:text-green-500 transition-colors" />
                                    <span className="text-sm font-bold text-foreground/70 group-hover:text-foreground">{t('header.settings')}</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-xl transition-all group border-t border-border mt-1 pt-4">
                                    <CreditCard size={18} className="text-foreground/40 group-hover:text-green-500 transition-colors" />
                                    <span className="text-sm font-bold text-foreground/70 group-hover:text-foreground">{t('header.subscription')}</span>
                                </button>
                            </div>

                            <button
                                onClick={handleTestTelegram}
                                className="w-full mt-2 flex items-center gap-3 p-3 hover:bg-accent/10 rounded-xl transition-all group text-accent"
                            >
                                <Wind size={18} className="group-hover:animate-bounce" />
                                <span className="text-sm font-extrabold uppercase tracking-wider">{t('header.test_telegram')}</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full mt-2 flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl transition-all group text-red-500"
                            >
                                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                <span className="text-sm font-extrabold uppercase tracking-wider">{t('header.sign_out')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
