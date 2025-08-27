
import React, { useState, useMemo } from 'react';
import type { PatientData, RiskLevel, AlertData, NewPatient } from '../types';
import { calculateRiskScore, calculateMedicationAdherence } from '../services/mockDataService';
import { addPatient as addPatientService } from '../services/supabaseService';
import { PatientDetailDashboard } from './PatientDetailDashboard';
import { AddPatientModal } from './AddPatientModal';
import { 
  Users, 
  AlertTriangle, 
  Activity,
  Search,
  TrendingUp,
  TrendingDown,
  Bell,
  HeartPulse,
  PlusCircle,
} from './icons';
import { useTranslation } from '../contexts/LanguageContext';

type Trend = 'improving' | 'worsening' | 'stable';

const getTrend = (measurements: PatientData['measurements']): Trend => {
    if (measurements.length < 10) return 'stable';
    const last5 = measurements.slice(-5);
    const prev5 = measurements.slice(-10, -5);
    const avgLast5Spo2 = last5.reduce((sum, m) => sum + m.spo2, 0) / 5;
    const avgPrev5Spo2 = prev5.reduce((sum, m) => sum + m.spo2, 0) / 5;

    if (avgLast5Spo2 > avgPrev5Spo2 + 0.5) return 'improving';
    if (avgLast5Spo2 < avgPrev5Spo2 - 0.5) return 'worsening';
    
    return 'stable';
};

const StatCard = ({ title, value, icon, valueColor }: {title: string, value: string | number, icon: React.ReactNode, valueColor?: string}) => (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm col-span-1">
        <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            {icon}
        </div>
        <div>
            <p className={`text-2xl font-bold ${valueColor || 'text-slate-800'}`}>{value}</p>
        </div>
    </div>
);

const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md ${isActive ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-slate-200/50'}`}>
        {children}
    </button>
);

interface DoctorDashboardProps {
    patients: PatientData[];
    alerts: AlertData[];
    onPatientAdded: () => void;
}

export function DoctorDashboard({ patients, alerts, onPatientAdded }: DoctorDashboardProps): React.ReactNode {
    const [activeTab, setActiveTab] = useState<'patients' | 'alerts'>('patients');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RiskLevel | 'All'>('All');
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
    const { t } = useTranslation();

    const translateRiskLevel = (level: RiskLevel) => {
        const key = `doctorDashboard.riskLevels.${level.toLowerCase()}`;
        return t(key);
    };

    const patientStats = useMemo(() => {
        return patients.map(p => ({ 
            ...p, 
            risk: calculateRiskScore(p), 
            trend: getTrend(p.measurements),
            adherence: calculateMedicationAdherence(p)
        }));
    }, [patients]);
    
    const filteredPatients = useMemo(() => {
        return patientStats.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || p.risk.level === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a,b) => {
             const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
             return riskOrder[b.risk.level] - riskOrder[a.risk.level] || b.risk.score - a.risk.score;
        });
    }, [patientStats, searchTerm, statusFilter]);

    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId) || null;
    }, [selectedPatientId, patients]);
    
    const criticalCount = patientStats.filter(p => p.risk.level === 'High').length;
    const warningCount = patientStats.filter(p => p.risk.level === 'Medium').length;
    const stableCount = patientStats.filter(p => p.risk.level === 'Low').length;

    const handleAddPatient = async (newPatient: NewPatient): Promise<PatientData | null> => {
        try {
            const addedPatient = await addPatientService(newPatient);
            onPatientAdded(); // Trigger data refresh in App.tsx
            return addedPatient;
        } catch (error) {
            console.error("Failed to add patient:", error);
            alert(t('doctorDashboard.addPatientError'));
            return null;
        }
    };

    const getRiskClasses = (level: RiskLevel) => {
        switch(level) {
            case 'High': return { color: 'text-red-600', dot: 'bg-red-500', row: 'bg-red-50/50' };
            case 'Medium': return { color: 'text-yellow-600', dot: 'bg-yellow-500', row: 'bg-yellow-50/50' };
            case 'Low': return { color: 'text-green-600', dot: 'bg-green-500', row: '' };
        }
    };

    const TrendIcon = ({ trend }: { trend: Trend }) => {
        if (trend === 'improving') return <TrendingUp className="h-5 w-5 text-green-500" />;
        if (trend === 'worsening') return <TrendingDown className="h-5 w-5 text-red-500" />;
        return <Activity className="h-5 w-5 text-blue-500" />;
    };

    const AlertIcon = ({ type }: { type: AlertData['type'] }) => {
        if (type === 'high_risk') return <AlertTriangle className="h-5 w-5 text-red-500" />;
        if (type === 'declining_trend') return <TrendingDown className="h-5 w-5 text-yellow-500" />;
        return <Bell className="h-5 w-5 text-blue-500" />;
    };

    if (selectedPatient) {
        return <PatientDetailDashboard patient={selectedPatient} onBack={() => setSelectedPatientId(null)} />;
    }
    
    return (
        <div className="animate-fade-in space-y-5">
            <AddPatientModal
                isOpen={isAddPatientModalOpen}
                onClose={() => setAddPatientModalOpen(false)}
                onAddPatient={handleAddPatient}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title={t('doctorDashboard.totalPatients')} value={patients.length} icon={<Users className="h-5 w-5 text-slate-400" />} />
                <StatCard title={t('doctorDashboard.critical')} value={criticalCount} icon={<AlertTriangle className="h-5 w-5 text-red-500" />} valueColor="text-red-600" />
                <StatCard title={t('doctorDashboard.warnings')} value={warningCount} icon={<Activity className="h-5 w-5 text-yellow-500" />} valueColor="text-yellow-600" />
                <StatCard title={t('doctorDashboard.stable')} value={stableCount} icon={<HeartPulse className="h-5 w-5 text-green-500" />} valueColor="text-green-600" />
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                <div className="p-1 bg-slate-200/50 rounded-lg flex items-center space-x-1 rtl:space-x-reverse">
                    <TabButton isActive={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>{t('doctorDashboard.patients')}</TabButton>
                    <TabButton isActive={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')}>
                       {t('doctorDashboard.alerts')} <span className="ml-2 mr-0 rtl:mr-2 rtl:ml-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{alerts.length}</span>
                    </TabButton>
                </div>
            </div>

            {activeTab === 'patients' && (
                 <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('doctorDashboard.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                         <select 
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as RiskLevel | 'All')}
                            className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                         >
                             <option value="All">{t('doctorDashboard.allStatuses')}</option>
                             <option value="Low">{t('doctorDashboard.riskLow')}</option>
                             <option value="Medium">{t('doctorDashboard.riskMedium')}</option>
                             <option value="High">{t('doctorDashboard.riskHigh')}</option>
                         </select>
                         <button 
                            onClick={() => setAddPatientModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>{t('doctorDashboard.addPatient')}</span>
                         </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.patient')}</th>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.riskScore')}</th>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.adherence')}</th>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.vitals')}</th>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.trend')}</th>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.status')}</th>
                                    <th scope="col" className="px-6 py-3">{t('doctorDashboard.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map(p => {
                                    const latestMeasurement = p.measurements.length > 0 ? p.measurements[p.measurements.length - 1] : null;
                                    const vitalsText = latestMeasurement ? `${latestMeasurement.spo2}% / ${latestMeasurement.heartRate} bpm` : '-- / --';
                                    const adherenceColor = p.adherence < 75 ? 'text-red-600' : p.adherence < 90 ? 'text-yellow-600' : 'text-green-600';

                                    return (
                                        <tr 
                                            key={p.id} 
                                            className={`border-b border-slate-200/80 ${getRiskClasses(p.risk.level).row} hover:bg-blue-50/50 cursor-pointer transition-colors duration-150`}
                                            onClick={() => setSelectedPatientId(p.id)}
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">{p.name}<div className="font-normal text-slate-500 text-xs">{t('doctorDashboard.yearsOld', { age: p.age })}</div></td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-2 font-semibold">{p.risk.score} <span className={`h-2 w-2 rounded-full ${getRiskClasses(p.risk.level).dot}`}></span></div></td>
                                            <td className={`px-6 py-4 font-semibold ${adherenceColor}`}>{p.adherence}%</td>
                                            <td className="px-6 py-4">{vitalsText}</td>
                                            <td className="px-6 py-4"><TrendIcon trend={p.trend} /></td>
                                            <td className={`px-6 py-4 font-semibold ${getRiskClasses(p.risk.level).color}`}>{translateRiskLevel(p.risk.level)}</td>
                                            <td className="px-6 py-4">
                                                 <button onClick={(e) => { e.stopPropagation(); setSelectedPatientId(p.id); }} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                                                    {t('doctorDashboard.details')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}

            {activeTab === 'alerts' && (
                <div className="space-y-3">
                    {alerts.map(alert => (
                        <div key={alert.id} className={`bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm flex items-start gap-4 border-l-4 rtl:border-r-4 rtl:border-l-0 ${alert.severity === 'high' ? 'border-red-500' : alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}`}>
                           <div className="pt-1"><AlertIcon type={alert.type} /></div>
                           <div className="flex-grow">
                                <p className="font-semibold text-slate-800">{alert.patientName}</p>
                                <p className="text-sm text-slate-600">{alert.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{alert.timestamp.toLocaleString()}</p>
                           </div>
                           <button onClick={() => setSelectedPatientId(alert.patientId)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                                {t('doctorDashboard.view')}
                           </button>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}
