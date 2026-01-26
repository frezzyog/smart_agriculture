'use client'

import React from 'react'
import ZoneComparisonChart from '@/components/dashboard/ZoneComparisonChart'
import HistoricalTrendsChart from '@/components/dashboard/HistoricalTrendsChart'
import { Map, BarChart2, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Zone Analytics</h1>
                <p className="text-gray-500 font-medium">Deep dive into sensor performance across all zones.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart 1: Zone Comparison */}
                <div className="relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <BarChart2 className="text-gray-300" />
                    </div>
                    <ZoneComparisonChart />
                </div>

                {/* Chart 2: Historical Trends */}
                <div className="relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Calendar className="text-gray-300" />
                    </div>
                    <HistoricalTrendsChart />
                </div>
            </div>

            {/* Insight Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <Map size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-2">Spatial Distribution Analysis</h3>
                        <p className="text-indigo-100 leading-relaxed max-w-2xl">
                            Zone B is showing consistent moisture retention usage compared to other zones, likely due to better shade coverage.
                            Consider reducing irrigation frequency in Zone B by 15% to conserve water.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
