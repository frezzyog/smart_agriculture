'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Download, PieChart, Activity, CheckCircle2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const ReportingCard = ({ zoneId }) => {
    const [isGenerating, setIsGenerating] = useState(false)

    const generatePDF = () => {
        setIsGenerating(true)

        try {
            const doc = new jsPDF()

            // Header
            doc.setFillColor(21, 255, 113) // #15ff71 accent color
            doc.rect(0, 0, 210, 40, 'F')

            doc.setTextColor(2, 6, 3) // Dark theme text
            doc.setFontSize(22)
            doc.setFont('helvetica', 'bold')
            doc.text('SMART AGRICULTURE 4.0', 20, 20)

            doc.setFontSize(10)
            doc.text('AI-GENERATED ANALYTICS REPORT', 20, 30)

            // Report Info
            doc.setTextColor(100, 100, 100)
            doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 20)
            doc.text(`Zone: ${zoneId || 'All Sectors'}`, 140, 25)

            // Body Content
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(16)
            doc.text('Executive Summary', 20, 55)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text('Based on machine learning analysis, your farm is performing within optimal parameters.', 20, 65)
            doc.text('Soil health remains "Good" across all monitored sectors with a slight moisture decrease predicted for Wed-Fri.', 20, 70)

            // Table Data
            const tableData = [
                ['Soil Moisture', '68%', 'Warning < 30%', 'Optimal'],
                ['Temperature', '28.4°C', 'Max 35°C', 'Optimal'],
                ['NPK Balance', 'Good', 'N/A', 'Balanced'],
                ['AI Stress Level', '12%', 'Panic > 80%', 'Low Stress'],
            ]

            doc.autoTable({
                startY: 80,
                head: [['Parameter', 'Current Value', 'Threshold', 'AI Status']],
                body: tableData,
                headStyles: { fillColor: [13, 26, 17] },
                alternateRowStyles: { fillColor: [240, 255, 245] },
            })

            // Footer
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(`Confidential - Smart Ag AI System - Page ${i} of ${pageCount}`, 105, 290, null, null, 'center')
            }

            doc.save(`SmartAg_Report_${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('PDF Generation failed:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Card className="p-8 bg-card border-border relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-accent border border-border">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Monthly Insights Report</h2>
                        <p className="text-xs text-foreground/40 mt-1">Export detailed AI diagnostics and sensor history for {zoneId || 'your farm'}.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-xl border border-border">
                        <PieChart size={16} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Analytics Ready</span>
                    </div>
                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-[#020603] rounded-xl font-bold text-sm shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <Activity size={18} className="animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        {isGenerating ? 'GENERTING...' : 'EXPORT PDF'}
                    </button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Reliability', value: '99.2%', icon: CheckCircle2, color: 'text-accent' },
                    { label: 'Data Points', value: '14,204', icon: Activity, color: 'text-blue-500' },
                    { label: 'AI Confidence', value: 'High', icon: FileText, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 bg-foreground/5 rounded-2xl border border-border flex items-center gap-3">
                        <stat.icon size={16} className={stat.color} />
                        <div>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-sm font-bold text-foreground">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default ReportingCard
