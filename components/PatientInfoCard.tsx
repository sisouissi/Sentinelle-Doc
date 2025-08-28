
import React, { useState } from 'react';
import type { PatientData } from '../types';
import { User, ClipboardCopy, CheckCircle, Key, Phone } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

export function PatientInfoCard({ patient }: { patient: PatientData }): React.ReactNode {
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation();
    const latestMeasurement = patient.measurements.length > 0 ? patient.measurements[patient.measurements.length - 1] : null;

    const handleCopyCode = () => {
        if (patient.code) {
            navigator.clipboard.writeText(patient.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-zinc-800 text-lg">{patient.name}</h3>
                    <p className="text-sm text-zinc-500">{t('doctorDashboard.yearsOld', { age: patient.age })}, {patient.condition}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg text-center">
                    <p className="text-xs text-indigo-600 font-semibold">SpO₂</p>
                    <p className="text-2xl font-bold text-indigo-800">{latestMeasurement ? `${latestMeasurement.spo2}%` : 'N/A'}</p>
                </div>
                 <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg text-center">
                    <p className="text-xs text-red-600 font-semibold">{t('trendsChart.heartRate')}</p>
                    <p className="text-2xl font-bold text-red-800">{latestMeasurement ? `${latestMeasurement.heartRate} bpm` : 'N/A'}</p>
                </div>
            </div>

            <div className="space-y-3 pt-4 mt-4 border-t border-zinc-200/80">
                <div>
                    <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {t('doctorDashboard.emergencyContact')}
                    </label>
                    {patient.emergency_contact_name && patient.emergency_contact_phone ? (
                        <div className="mt-1 text-sm text-zinc-700 pl-1">
                           <p className="font-semibold">{patient.emergency_contact_name}</p>
                           <p className="text-xs text-zinc-500">{patient.emergency_contact_phone}</p>
                        </div>
                     ) : (
                        <p className="text-xs text-zinc-400 mt-1 pl-1">Non configuré par le patient.</p>
                     )}
                </div>

                {patient.code && (
                    <div>
                        <label className="text-xs font-medium text-zinc-500">{t('addPatientModal.pairingCode')}</label>
                        <div className="mt-1 flex items-center gap-2">
                             <div className="flex-grow flex items-center gap-2 bg-zinc-100 p-2 rounded-lg text-sm">
                                <Key className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                <span className="font-mono text-zinc-700">{patient.code}</span>
                             </div>
                            <button onClick={handleCopyCode} className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-100' : 'bg-zinc-200 hover:bg-zinc-300'}`}>
                               {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <ClipboardCopy className="w-5 h-5 text-zinc-600" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
