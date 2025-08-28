import React, { useMemo } from 'react';
import type { PatientReportedData, SmokingCessationLog, SmokingCessationLogType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SmokingOff, AlertTriangle, CheckCircle, Cigarette } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

const StatCard = ({ label, value, icon, isGood }: { label: string; value: string | number; icon: React.ReactNode; isGood?: boolean }) => (
    <div className={`p-3 rounded-lg flex-1 flex items-center gap-3 ${isGood ? 'bg-green-100/70' : 'bg-zinc-100/70'}`}>
        <div className={`flex-shrink-0 ${isGood ? 'text-green-600' : 'text-zinc-500'}`}>{icon}</div>
        <div>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-xl font-bold text-zinc-800">{value}</p>
        </div>
    </div>
);

const LogIcon = ({ type }: { type: SmokingCessationLogType }) => {
    if (type === 'smoked') return <Cigarette className="w-5 h-5 text-red-500" />;
    if (type === 'craving') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    if (type === 'resisted') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return null;
};

export function SmokingCessationTab({ smokingData, logs }: { smokingData: PatientReportedData['smoking'], logs: SmokingCessationLog[] }): React.ReactNode {
    const { t, language } = useTranslation();
    const locale = language === 'ar' ? 'ar-EG' : language;

    const weeklyCigarettesData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayKey = d.toLocaleDateString(locale, { weekday: 'short' });
            data[dayKey] = 0;
        }

        logs.filter(log => log.type === 'smoked').forEach(log => {
            const logDate = new Date(log.timestamp);
            const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays < 7) {
                const dayKey = logDate.toLocaleDateString(locale, { weekday: 'short' });
                if (data[dayKey] !== undefined) {
                    data[dayKey]++;
                }
            }
        });

        return Object.entries(data).map(([day, cigarettes]) => ({ day, cigarettes }));
    }, [logs, locale]);

    const isNonSmoker = smokingData.daysSmokeFree > 365;

    if (isNonSmoker) {
         return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <SmokingOff className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold text-zinc-800">{t('smokingCessation.nonSmoker')}</h3>
                    <p>{t('smokingCessation.nonSmokerMessage')}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 animate-fade-in">
            <div className="xl:col-span-2 space-y-5">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                     <h3 className="text-md font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                        <SmokingOff className="w-5 h-5 text-indigo-600"/>
                        {t('smokingCessation.title')}
                    </h3>
                    <div className="flex flex-col gap-3">
                        <StatCard label={t('smokingCessation.smokedToday')} value={smokingData.cigarettesSmokedToday} icon={<Cigarette className="w-5 h-5" />} />
                        <StatCard label={t('smokingCessation.cravingsToday')} value={smokingData.cravingsToday} icon={<AlertTriangle className="w-5 h-5" />} />
                        <StatCard label={t('smokingCessation.smokeFreeDays')} value={smokingData.daysSmokeFree} icon={<CheckCircle className="w-5 h-5" />} isGood={smokingData.daysSmokeFree > 0} />
                    </div>
                </div>

                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                    <h3 className="text-md font-semibold text-zinc-700 mb-2">{t('smokingCessation.recentActivity')}</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {logs.slice(0, 10).map(log => (
                            <div key={log.id} className="flex items-center gap-3 text-sm">
                                <LogIcon type={log.type} />
                                <div className="flex-grow">
                                    <p className="font-medium text-zinc-700">{t(`smokingCessation.log.${log.type}`)}</p>
                                    {log.trigger && <p className="text-xs text-zinc-500">{t('smokingCessation.trigger')}: {log.trigger}</p>}
                                </div>
                                <p className="text-xs text-zinc-400">{new Date(log.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        ))}
                         {logs.length === 0 && <p className="text-sm text-center text-zinc-500 py-4">{t('smokingCessation.noLogs')}</p>}
                    </div>
                </div>
            </div>

            <div className="xl:col-span-3 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-[500px] transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <h3 className="text-md font-semibold text-zinc-700 mb-2">{t('smokingCessation.weeklyCigarettes')}</h3>
                 <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={weeklyCigarettesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
                        <YAxis stroke="#a1a1aa" fontSize={12} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '0.75rem',
                            }}
                        />
                        <Bar dataKey="cigarettes" name={t('smokingCessation.smokedToday')} fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
