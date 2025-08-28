import React, { useMemo } from 'react';
import type { SpeechData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AudioLines, BarChart, Clock, Wind } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

const StatCard = ({ label, value, unit, icon, isWarning }: { label: string; value: string | number; unit: string; icon: React.ReactNode; isWarning?: boolean }) => (
    <div className={`p-3 rounded-lg flex items-center gap-3 transition-transform duration-200 hover:scale-105 hover:shadow-sm ${isWarning ? 'bg-yellow-100/70' : 'bg-zinc-100/70'}`}>
        <div className={`flex-shrink-0 ${isWarning ? 'text-yellow-600' : 'text-zinc-500'}`}>{icon}</div>
        <div>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-base font-bold text-zinc-800">
                {value} <span className="text-sm font-normal text-zinc-600">{unit}</span>
            </p>
        </div>
    </div>
);

export function SpeechAnalysisTab({ speechData }: { speechData: SpeechData }): React.ReactNode {
    const { t, language } = useTranslation();
    const locale = language === 'ar' ? 'ar-EG' : language;

    const lastAnalysisDate = new Date(speechData.lastAnalysisTimestamp).toLocaleString(locale, {
        day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
    });

    const historicalData = useMemo(() => {
        const history = [];
        const days = [t('days.d6'), t('days.d5'), t('days.d4'), t('days.d3'), t('days.d2'), t('days.d1'), t('days.today')];
        for (let i = 0; i < 6; i++) {
            history.push({
                day: days[i],
                [t('speechAnalysis.speechRateLabel')]: speechData.speechRateWPM + (Math.random() - 0.7) * 15,
                [t('speechAnalysis.pauseFreqLabel')]: speechData.pauseFrequencyPerMin + (Math.random() - 0.3) * 3,
                [t('speechAnalysis.articulationLabel')]: speechData.articulationScore + (Math.random() - 0.7) * 10,
            });
        }
        history.push({
            day: days[6],
            [t('speechAnalysis.speechRateLabel')]: speechData.speechRateWPM,
            [t('speechAnalysis.pauseFreqLabel')]: speechData.pauseFrequencyPerMin,
            [t('speechAnalysis.articulationLabel')]: speechData.articulationScore,
        });

        return history.map(item => ({
            ...item,
            [t('speechAnalysis.speechRateLabel')]: Math.max(80, Math.min(160, Math.round(item[t('speechAnalysis.speechRateLabel')]))),
            [t('speechAnalysis.pauseFreqLabel')]: Math.max(1, Math.min(10, Math.round(item[t('speechAnalysis.pauseFreqLabel')]))),
            [t('speechAnalysis.articulationLabel')]: Math.max(70, Math.min(100, Math.round(item[t('speechAnalysis.articulationLabel')]))),
        }));
    }, [speechData, t, language]);

    if (!speechData || speechData.speechRateWPM === 0) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <AudioLines className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                    <p>{t('speechAnalysis.noData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 animate-fade-in transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-md font-semibold text-zinc-700 mb-1 flex items-center gap-2">
                        <AudioLines className="w-5 h-5 text-indigo-600"/>
                        {t('speechAnalysis.title')}
                    </h3>
                    <p className="text-xs text-zinc-500">{t('speechAnalysis.lastAnalysis')}: {lastAnalysisDate}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label={t('speechAnalysis.speechRate')} value={speechData.speechRateWPM} unit={t('speechAnalysis.wpm')} icon={<Wind className="w-5 h-5" />} isWarning={speechData.speechRateWPM < 110} />
                <StatCard label={t('speechAnalysis.pauseFrequency')} value={speechData.pauseFrequencyPerMin} unit={t('speechAnalysis.perMin')} icon={<Clock className="w-5 h-5" />} isWarning={speechData.pauseFrequencyPerMin > 6} />
                <StatCard label={t('speechAnalysis.articulationScore')} value={speechData.articulationScore} unit="/ 100" icon={<BarChart className="w-5 h-5" />} isWarning={speechData.articulationScore < 85} />
            </div>

            <div>
                <h4 className="text-sm font-semibold text-zinc-600 mb-2">{t('speechAnalysis.historicalTrend')}</h4>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
                            <YAxis yAxisId="left" stroke="#8884d8" domain={[80, 160]} fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[70, 100]} unit="%" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.75rem',
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Line yAxisId="left" type="monotone" dataKey={t('speechAnalysis.speechRateLabel')} stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey={t('speechAnalysis.articulationLabel')} stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                             <Line yAxisId="left" type="monotone" dataKey={t('speechAnalysis.pauseFreqLabel')} stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }}  hide={true} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
