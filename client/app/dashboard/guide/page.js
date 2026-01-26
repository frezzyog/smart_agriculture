'use client'

import React from 'react'
import { BookOpen, Search, Play, Book, Lightbulb, ChefHat, HeartPulse, Microscope, ArrowRight, Droplets, Bug, Cpu, Atom } from 'lucide-react'

export default function GuidePage() {
    const guides = [
        { id: 1, title: 'Optimizing NPK for Lettuce', category: 'Nutrients', time: '12 min read', icon: Microscope, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 2, title: 'Early Pest Detection', category: 'Protection', time: '8 min read', icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-400/10' },
        { id: 3, title: 'Hydroponic Best Practices', category: 'Setup', time: '15 min read', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { id: 4, title: 'From Farm to Table: Storage', category: 'Harvest', time: '10 min read', icon: ChefHat, color: 'text-green-400', bg: 'bg-green-400/10' },
    ]

    return (
        <div className="ml-64 p-10 min-h-screen bg-background text-white">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            Farmer <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Guide</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Educational resources and expert tips for precision agriculture.</p>
                    </div>
                </div>

                <div className="relative mb-12">
                    <input
                        type="text"
                        placeholder="Search for guides, crops, or best practices..."
                        className="w-full h-16 pl-16 pr-8 bg-white/5 border border-white/10 rounded-[2rem] text-white placeholder-gray-500 focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Featured Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-white/5 group bg-gradient-to-br from-[#0d1a11] to-[#020603] p-12">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[150px] opacity-10 -mr-40 -mt-40 group-hover:opacity-20 transition-opacity"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="shrink-0 w-full md:w-64 h-48 bg-white/5 bg-[url('https://images.unsplash.com/photo-1558449028-b53a39d100fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80')] bg-cover bg-center rounded-3xl border border-white/10 block relative group/vid overflow-hidden">
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 bg-accent text-[#020603] rounded-full flex items-center justify-center">
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-4 block">Recommended for you</span>
                                    <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">Mastering Vertical <br />Farm Automation</h2>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md mb-8">Learn how to configure your sensor array for maximum ROI and minimal labor costs using our AI engine.</p>
                                    <button className="flex items-center gap-2 group text-accent text-xs font-black uppercase tracking-widest">
                                        Watch Video Course <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {guides.map((guide) => (
                                <div key={guide.id} className="bg-card p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.02] hover:scale-[1.02] transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-xl ${guide.bg} ${guide.color}`}>
                                            <guide.icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{guide.time}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">{guide.title}</h3>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{guide.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-card p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <BookOpen size={20} className="text-accent" />
                                Knowledge Hub
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Crop Nutrition', count: 12, icon: Atom },
                                    { name: 'Pest Control', count: 8, icon: Bug },
                                    { name: 'System Hardware', count: 15, icon: Cpu },
                                    { name: 'Water Management', count: 10, icon: Droplets },
                                ].map((cat, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <cat.icon size={18} className="text-gray-500 group-hover:text-accent transition-colors" />
                                            <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-accent rounded-[2.5rem] p-8 text-[#020603]">
                            <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                <Book size={20} />
                                Farmer's Wiki
                            </h4>
                            <p className="text-sm font-bold opacity-70 mb-6">Access our offline-first encyclopedia for remote agricultural work.</p>
                            <button className="w-full py-4 bg-[#020603] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                                Download Wiki
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
