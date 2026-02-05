'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import {
    MessageSquare, Send, User, Bot, Sparkles,
    ChevronDown, X, Loader2, Maximize2, Minimize2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AIChatFloatingButton() {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const [messages, setMessages] = useState([
        { id: 1, role: 'bot', text: t('chatbot.welcome') },
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [devices, setDevices] = useState([])
    const [selectedDeviceId, setSelectedDeviceId] = useState('')
    const scrollRef = useRef(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping, isOpen])

    // Fetch devices for context
    useEffect(() => {
        if (isOpen && devices.length === 0) {
            const fetchDevices = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                    const res = await fetch(`${apiUrl}/api/devices`)
                    const data = await res.json()
                    if (Array.isArray(data) && data.length > 0) {
                        setDevices(data)
                        setSelectedDeviceId(data[0].device_id || data[0].deviceId)
                    }
                } catch (err) {
                    console.error('Failed to fetch devices for chat context:', err)
                }
            }
            fetchDevices()
        }
    }, [isOpen, devices.length])

    const handleSend = async () => {
        if (!input.trim()) return
        const userMsg = { id: Date.now(), role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        const currentInput = input
        setInput('')
        setIsTyping(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    deviceId: selectedDeviceId
                })
            })
            const data = await response.json()

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                text: data.reply || t('chatbot.no_reply')
            }])
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                text: t('chatbot.error')
            }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`
                        mb-4 bg-card border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto
                        transition-all duration-300 origin-bottom-right
                        ${isMaximized ? 'w-[calc(100vw-48px)] h-[calc(100vh-120px)] max-w-4xl' : 'w-[380px] h-[580px] max-h-[70vh]'}
                    `}
                >
                    {/* Header */}
                    <div className="p-4 bg-accent text-background flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-background/20 rounded-xl">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-tight leading-none uppercase">{t('chatbot.title')}</h3>
                                <p className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">{t('chatbot.analyzing')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="p-2 hover:bg-background/10 rounded-lg transition-colors"
                            >
                                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-background/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Device Selector (Context) */}
                    {devices.length > 0 && (
                        <div className="px-4 py-2 bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('iot.device_id')}</span>
                            <select
                                value={selectedDeviceId}
                                onChange={(e) => setSelectedDeviceId(e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-accent outline-none cursor-pointer"
                            >
                                {devices.map(d => (
                                    <option key={d.id} value={d.device_id || d.deviceId} className="bg-card">{d.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                    >
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accent text-background' : 'bg-zinc-100 dark:bg-white/5 text-accent border border-zinc-200 dark:border-white/10'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-[13px] md:text-sm font-medium leading-relaxed shadow-sm w-full ${msg.role === 'user' ? 'bg-accent text-background rounded-tr-none' : 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-gray-100 border border-zinc-200 dark:border-white/10 rounded-tl-none'}`}>
                                        {msg.role === 'bot' ? (
                                            <div className="prose dark:prose-invert prose-xs md:prose-sm max-w-none prose-p:text-inherit prose-p:leading-relaxed prose-li:my-1 break-words">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <span className="break-words">{msg.text}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-white/5 text-accent border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                                        <Bot size={14} className="animate-pulse" />
                                    </div>
                                    <div className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-gray-500 border border-zinc-200 dark:border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase italic">{t('chatbot.analyzing')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-white/5 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('chatbot.input_placeholder')}
                            className="w-full h-12 pl-4 pr-12 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-accent/40 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            className="absolute right-6 top-[22px] text-accent hover:scale-110 transition-transform"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95
                    ${isOpen ? 'bg-white/10 text-white rotate-90' : 'bg-accent text-background shadow-[0_10px_30px_rgba(21,255,113,0.3)]'}
                `}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-background"></span>
                    </span>
                )}
            </button>
        </div>
    )
}
