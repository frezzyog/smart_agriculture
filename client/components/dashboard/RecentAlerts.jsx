import { AlertTriangle, CheckCircle, Info, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const RecentAlerts = () => {
    const { t } = useTranslation()

    const alerts = [
        {
            id: 1,
            title: t('dashboard.alert_low_moisture'),
            description: t('dashboard.alert_low_moisture_desc'),
            time: '10:24 AM',
            type: t('dashboard.critical'),
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
        {
            id: 2,
            title: t('dashboard.alert_battery_full'),
            description: t('dashboard.alert_battery_full_desc'),
            time: '09:15 AM',
            type: t('dashboard.info'),
            icon: RefreshCcw,
            color: 'text-accent',
            bg: 'bg-accent/10'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <RefreshCcw size={20} className="text-accent" />
                <h3 className="text-xl font-bold text-foreground tracking-tight">{t('dashboard.alerts_header')}</h3>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-card rounded-[2rem] border border-border group hover:bg-foreground/5 transition-colors gap-4">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${alert.bg} flex items-center justify-center ${alert.color} shrink-0`}>
                                <alert.icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h4 className="text-base md:text-lg font-bold text-foreground tracking-tight">{alert.title}</h4>
                                <p className="text-xs md:text-sm text-foreground/50 font-medium mt-0.5">{alert.description}</p>
                            </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                            <span className="text-[10px] md:text-xs font-bold text-foreground/40 block sm:mb-2">{alert.time}</span>
                            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] px-2 py-0.5 rounded ${alert.type === t('dashboard.critical') ? 'bg-red-500/20 text-red-500' : 'bg-accent/20 text-accent'}`}>
                                {alert.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentAlerts
