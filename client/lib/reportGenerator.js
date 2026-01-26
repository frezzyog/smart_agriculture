import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateDashboardReport = (sensorData, activities) => {
    const doc = new jsPDF()
    const timestamp = new Date().toLocaleString()

    // --- Header ---
    doc.setFillColor(34, 197, 94) // Green
    doc.rect(0, 0, 210, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Smart Agriculture - System Report', 14, 13)

    // --- System Status ---
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${timestamp}`, 14, 30)
    doc.text(`Device ID: ${sensorData.deviceId || 'N/A'}`, 14, 35)
    doc.text(`Status: ${sensorData.connected ? 'ONLINE' : 'OFFLINE'}`, 14, 40)

    // --- Current Readings ---
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Current Sensor Readings', 14, 55)

    const tableData = [
        ['Sensor', 'Value', 'Status'],
        ['Soil Moisture', `${sensorData.moisture.toFixed(1)}%`, sensorData.moisture < 30 ? 'Low' : 'Optimal'],
        ['Rain Level', `${sensorData.rain.toFixed(1)}%`, sensorData.rain > 50 ? 'Raining' : 'Clear'],
        ['Pump Status', sensorData.pumpStatus ? 'ON' : 'OFF', '-'],
    ]

    autoTable(doc, {
        startY: 60,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
    })

    // --- Activity Log ---
    // autoTable (functional) usually still attaches lastAutoTable to the doc
    const lastY = doc.lastAutoTable.finalY || 80
    doc.text('Recent System Activity', 14, lastY + 15)

    const activityRows = activities.map(act => [
        act.time,
        act.type.toUpperCase(),
        act.content
    ])

    autoTable(doc, {
        startY: lastY + 20,
        head: [['Time', 'Type', 'Description']],
        body: activityRows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [50, 50, 50] },
    })

    // --- Footer ---
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Smart Ag AI - Automated Report', 14, 280)

    doc.save(`smart-ag-report-${Date.now()}.pdf`)
}
