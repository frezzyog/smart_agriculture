'use client'

import React, { useState } from 'react'
import { MessageSquare, Send, User, Bot, Sparkles, Phone, Mail, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function ChatbotPage() {
    const [messages, setMessages] = useState([
        { id: 1, role: 'bot', text: 'Hello! I am your AI Agronomist. How can I help you today?' },
    ])
    const [input, setInput] = useState('')
    const [openFaq, setOpenFaq] = useState(0)

    const faqs = [
        {
            question: "How do I recalibrate the soil moisture sensor?",
            answer: "To recalibrate, remove the sensor from soil, wipe it dry, and press the 'Calibrate' button on the device hardware for 5 seconds."
        },
        {
            question: "Why is the pump not triggering automatically?",
            answer: "Check if 'AI Auto-Pilot' mode is enabled in the Dashboard. Manual overrides pause auto-scheduling for 60 minutes."
        }
    ]

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { id: Date.now(), role: 'user', text: input }])
        setInput('')
        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: "I've analyzed your request. Based on current sensor data, everything looks optimal. Would you like a detailed report?" }])
        }, 1000)
    }

    return (
        <div className="ml-64 p-10 min-h-screen bg-background text-white">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Chat Section */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-160px)]">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            AI <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Chatbot</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Instant agricultural advice and system troubleshooting.</p>
                    </div>

                    <div className="flex-1 bg-card rounded-[2.5rem] border border-white/5 p-8 flex flex-col overflow-hidden relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accent text-[#020603]' : 'bg-white/5 text-accent border border-white/10'}`}>
                                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                        </div>
                                        <div className={`p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-accent text-[#020603] rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about soil health, irrigation levels..."
                                className="w-full h-16 pl-8 pr-20 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-3 top-3 w-10 h-10 bg-accent text-[#020603] rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card rounded-[2.5rem] p-8 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="text-accent" />
                            <h3 className="text-xl font-bold text-white">Common Questions</h3>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="border border-white/5 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(idx === openFaq ? -1 : idx)}
                                        className="w-full p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-all"
                                    >
                                        <span className="text-xs font-bold text-gray-300 text-left">{faq.question}</span>
                                        {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    {openFaq === idx && (
                                        <div className="p-4 text-xs text-gray-500 font-medium leading-relaxed bg-white/[0.02]">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-accent rounded-[2.5rem] p-8 text-[#020603] overflow-hidden relative group">
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-20 rotate-12 group-hover:scale-110 transition-transform" />
                        <h4 className="text-2xl font-black mb-2">Expert Human <br />Support</h4>
                        <p className="text-[#020603]/70 text-sm font-bold mb-6">Available 24/7 for tailored agronomist advice.</p>
                        <button className="w-full py-4 bg-[#020603] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                            Talk to Human
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
