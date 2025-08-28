import React, { useMemo } from 'react';
import type { PatientData, Medication } from '../types';
import { Pill, CheckCircle, XCircle, Sun, Moon } from './icons';
import { calculateMedicationAdherence } from '../services/mockDataService';
import { useTranslation } from '../contexts/LanguageContext';

interface MedicationAdherenceCardProps {
    patient: PatientData;
}

type DoseStatus = 'taken' | 'missed' | 'scheduled' | 'not-applicable';

interface ScheduleStatus {
    timeOfDay: string;
    status: DoseStatus;
}
interface DayStatus {
    date: Date;
    schedules: ScheduleStatus[];
}
interface AdherenceData {
    medication: Medication;
    days: DayStatus[];
}

const TimeOfDayIcon = ({ timeOfDay }: { timeOfDay: string }) => {
    const lowerTime = timeOfDay.toLowerCase();
    if (lowerTime.includes('matin') || lowerTime.includes('morning') || lowerTime.includes('صباح')) {
        return <Sun className="w-4 h-4 text-yellow-500" />;
    }
    if (lowerTime.includes('soir') || lowerTime.includes('evening') || lowerTime.includes('مساء')) {
        return <Moon className="w-4 h-4 text-indigo-500" />;
    }
    return null;
}

export function MedicationAdherenceCard({ patient }: MedicationAdherenceCardProps): React.ReactNode {
    const { t } = useTranslation();
    const adherence = calculateMedicationAdherence(patient);

    const StatusIcon = ({ status }: { status: DoseStatus }) => {
        if (status === 'taken') {
            // FIX: Wrap icon in a span with a title to fix SVG prop type error and add translation.
            return <span title={t('medicationAdherence.taken')}><CheckCircle className="w-5 h-5 text-green-500" /></span>;
        }
        if (status === 'missed') {
            // FIX: Wrap icon in a span with a title to fix SVG prop type error and add translation.
            return <span title={t('medicationAdherence.missed')}><XCircle className="w-5 h-5 text-red-500" /></span>;
        }
         if (status === 'scheduled') {
            return <div className="w-3 h-3 rounded-full bg-zinc-300" title={t('medicationAdherence.scheduled')}></div>;
        }
        return <div className="w-4 h-0.5 bg-zinc-200" title={t('medicationAdherence.notApplicable')}></div>;
    };

    const adherenceData = useMemo((): AdherenceData[] => {
        const today = new Date();
        const last7Days: Date[] = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - i);
            return d;
        }).reverse();

        return patient.medications
            .filter(med => med.is_active && med.schedules.some(s => !s.time_of_day.includes('Au besoin')))
            .map(med => {
                const days: DayStatus[] = last7Days.map(day => {
                    const schedules: ScheduleStatus[] = med.schedules
                        .filter(s => !s.time_of_day.includes('Au besoin'))
                        .map(schedule => {
                            const timeMatch = schedule.time_of_day.match(/(\d{2}:\d{2})/);
                            const hour = timeMatch ? parseInt(timeMatch[1].split(':')[0]) : 9;
                            const minute = timeMatch ? parseInt(timeMatch[1].split(':')[1]) : 0;
                            
                            const scheduledTime = new Date(day);
                            scheduledTime.setHours(hour, minute, 0, 0);

                            const log = patient.medication_logs.find(l => 
                                l.schedule_id === schedule.id &&
                                new Date(l.taken_at).toDateString() === day.toDateString()
                            );

                            let status: DoseStatus = 'scheduled';
                            if (log) {
                                status = 'taken';
                            } else if (scheduledTime < today) {
                                status = 'missed';
                            }

                            return { timeOfDay: schedule.time_of_day, status };
                        });
                    return { date: day, schedules };
                });
                return { medication: med, days };
            });
    }, [patient]);

    const getAdherenceGradient = (percent: number) => {
        if (percent < 75) return 'from-red-500 to-red-600';
        if (percent < 90) return 'from-yellow-400 to-yellow-500';
        return 'from-green-500 to-green-600';
    };
    
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;


    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-md font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                {t('doctorDashboard.adherenceDetailTitle')}
            </h3>
            
            <div className="my-4">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-zinc-600 font-medium">{t('medicationAdherence.adherenceRate')} ({t('medicationAdherence.last7days')})</span>
                    <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getAdherenceGradient(adherence)}`}>
                        {adherence}%
                    </span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full bg-gradient-to-r ${getAdherenceGradient(adherence)}`} style={{ width: `${adherence}%` }}></div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-zinc-600 mb-2">{t('medicationAdherence.weeklyLog')}</h4>
                 <div className="overflow-x-auto">
                    {adherenceData.length > 0 ? (
                        <table className="w-full text-sm text-center border-collapse">
                            <thead>
                                <tr className="bg-zinc-100/70">
                                    <th className="text-left rtl:text-right p-2 font-semibold text-zinc-600">{t('medicationAdherence.medication')}</th>
                                    {adherenceData[0].days.map(({ date }) => (
                                        <th key={date.toISOString()} className="p-2 font-medium text-zinc-500">
                                            {t(`days.short.${dayKeys[date.getDay()]}`)}
                                            <div className="text-xs text-zinc-400">{date.getDate()}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {adherenceData.map(({ medication, days }) => (
                                    <tr key={medication.id} className="border-b border-zinc-200 last:border-b-0">
                                        <td className="text-left rtl:text-right p-2 whitespace-nowrap">
                                            <p className="font-medium text-zinc-800">{medication.name}</p>
                                            <p className="text-xs text-zinc-500">{medication.dosage}</p>
                                        </td>
                                        {days.map(({ date, schedules }) => (
                                            <td key={date.toISOString()} className="p-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    {schedules.map((s, i) => (
                                                        <div key={i} className="flex flex-col items-center gap-0.5">
                                                            <TimeOfDayIcon timeOfDay={s.timeOfDay} />
                                                            <StatusIcon status={s.status} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-10 text-sm text-zinc-500 bg-zinc-50 rounded-lg border border-zinc-200">
                            <Pill className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
                            <p>{t('medicationAdherence.noData')}</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}