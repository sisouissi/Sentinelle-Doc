import React from 'react';
import type { AnomalyAlert } from '../types';
import { AlertTriangle, TrendingDown, BedDouble, Lungs } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

const AlertIcon = ({ type }: { type: AnomalyAlert['type'] }) => {
    const commonClasses = "w-5 h-5";
    if (type === 'vital_sign_anomaly') return <AlertTriangle className={`${commonClasses} text-red-500`} />;
    if (type === 'mobility_decline') return <TrendingDown className={`${commonClasses} text-yellow-600`} />;
    if (type === 'sleep_disruption') return <BedDouble className={`${commonClasses} text-purple-500`} />;
    if (type === 'cough_increase') return <Lungs className={`${commonClasses} text-blue-500`} />;
    return <AlertTriangle className={`${commonClasses} text-slate-500`} />;
};

export function AlertsTimeline({ alerts }: { alerts: AnomalyAlert[] }): React.ReactNode {
    const { t } = useTranslation();

    const translateAlertType = (type: AnomalyAlert['type']) => {
        return t(`alertsTimeline.types.${type}`);
    }

    const translateSeverity = (severity: 'high' | 'medium' | 'low') => {
        return t(`alertsTimeline.severities.${severity}`);
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold text-slate-700 mb-3">{t('alertsTimeline.title')}</h3>
            {alerts.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                    <p>{t('alertsTimeline.none')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 animate-fade-in">
                            <div className="flex flex-col items-center">
                                <div className="bg-slate-200/80 p-2 rounded-full">
                                   <AlertIcon type={alert.type} />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-slate-800">
                                    {translateAlertType(alert.type)}
                                </p>
                                <p className="text-xs text-slate-600">{alert.description}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(alert.timestamp).toLocaleTimeString()} - {t('alertsTimeline.severity', { level: translateSeverity(alert.severity) })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}