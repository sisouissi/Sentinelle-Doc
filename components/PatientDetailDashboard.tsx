import React, { useState, useEffect } from 'react';
import type { PatientData, CompletePrediction, ChatMessage } from '../types';
import * as supabaseService from '../services/supabaseService';
import { predictionService } from '../services/predictionService';
import { ArrowLeft, BrainCircuit, MessageCircle, HeartPulse, ClipboardList, Cloudy } from './icons';
import { PredictionCard } from './PredictionCard';
import { AlertsTimeline } from './AlertsTimeline';
import { RealTimeChart } from './RealTimeChart';
import { LocationHeatmap } from './LocationHeatmap';
import { ChatHistoryViewer } from './ChatHistoryViewer';
import { MedicationAdherenceCard } from './MedicationAdherenceCard';
import { PatientInfoCard } from './PatientInfoCard';
import { TrendsChart } from './TrendsChart';
import { SleepDetailsCard } from './SleepDetailsCard';
import { EnvironmentTab } from './EnvironmentTab';
import { useTranslation } from '../contexts/LanguageContext';

interface PatientDetailDashboardProps {
  patient: PatientData;
  onBack: () => void;
}

const LoadingState: React.FC<{text: string}> = ({text}) => (
    <div className="flex items-center justify-center h-full text-slate-500 py-10">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);

const TabButton = ({ isActive, onClick, children, icon }: { isActive: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }) => (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 flex-grow whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-white/80'}`}>
        {icon} {children}
    </button>
);

type ActiveDetailTab = 'prediction' | 'vitals' | 'observance' | 'chat' | 'environnement';

export function PatientDetailDashboard({ patient, onBack }: PatientDetailDashboardProps): React.ReactNode {
    const [prediction, setPrediction] = useState<CompletePrediction | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[] | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveDetailTab>('prediction');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const { t, language } = useTranslation();

    useEffect(() => {
        // Reset state when the patient changes to avoid showing stale data from the previous patient.
        setPrediction(null);
        setChatHistory(null);
        setActiveTab('prediction');
    }, [patient.id]);

    useEffect(() => {
        predictionService.startStreaming(patient.id, language, t);
        const unsubscribePrediction = predictionService.onUpdate(setPrediction);

        return () => {
            unsubscribePrediction();
            predictionService.stopStreaming();
        };
    }, [patient.id, language, t]);

     useEffect(() => {
        if (activeTab === 'chat' && !chatHistory) {
            setIsChatLoading(true);
            supabaseService.getChatHistory(patient.id, language)
                .then(setChatHistory)
                .catch(console.error)
                .finally(() => setIsChatLoading(false));
        }
    }, [patient.id, activeTab, chatHistory, language]);

    const renderContent = () => {
        if (activeTab === 'prediction') {
            if (!prediction) {
                return <LoadingState text={t('patientDetail.loadingPrediction')} />;
            }
            return (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in">
                    <div className="xl:col-span-1 space-y-5">
                       <PredictionCard prediction={prediction} />
                       <AlertsTimeline alerts={prediction.alerts} />
                    </div>
                    <div className="xl:col-span-2 space-y-5">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm h-72">
                           <h3 className="text-md font-semibold text-slate-700 mb-2">{t('patientDetail.hourlyActivity')}</h3>
                           <RealTimeChart activityData={prediction.activityData} />
                        </div>
                         <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
                           <LocationHeatmap heatmapData={prediction.heatmapData} />
                        </div>
                    </div>
                </div>
            )
        }
        if (activeTab === 'vitals') {
            return (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in">
                    <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm h-96">
                        <h3 className="text-md font-semibold text-slate-700 mb-2">{t('patientDetail.vitalsMonitoring')}</h3>
                        <TrendsChart measurements={patient.measurements} />
                    </div>
                    <div className="xl:col-span-1 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
                        <SleepDetailsCard data={patient.smartphone.sleep} />
                    </div>
                </div>
            )
        }
         if (activeTab === 'environnement') {
            return <EnvironmentTab patient={patient} />;
        }
        if (activeTab === 'observance') {
            return (
                <div className="animate-fade-in">
                    <MedicationAdherenceCard patient={patient} />
                </div>
            )
        }
        if (activeTab === 'chat') {
            if (isChatLoading) {
                return <LoadingState text={t('patientDetail.loadingChat')} />;
            }
            if (!chatHistory || chatHistory.length === 0) {
                 return (
                    <div className="text-center py-10 text-slate-500 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
                        <p>{t('patientDetail.noChatHistory')}</p>
                    </div>
                );
            }
            return <ChatHistoryViewer history={chatHistory} />;
        }
    };

    return (
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-4">
            <div className="flex-grow">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-2">
                    <ArrowLeft className="w-4 h-4" /> {t('app.header.title')}
                </button>
                 <PatientInfoCard patient={patient} />
            </div>

            <div className="w-full md:w-auto p-1.5 bg-slate-200/80 rounded-xl flex flex-col items-center gap-1">
                <TabButton isActive={activeTab === 'prediction'} onClick={() => setActiveTab('prediction')} icon={<BrainCircuit className="w-4 h-4"/>}>{t('patientDetail.tabs.prediction')}</TabButton>
                <TabButton isActive={activeTab === 'vitals'} onClick={() => setActiveTab('vitals')} icon={<HeartPulse className="w-4 h-4"/>}>{t('patientDetail.tabs.vitals')}</TabButton>
                <TabButton isActive={activeTab === 'environnement'} onClick={() => setActiveTab('environnement')} icon={<Cloudy className="w-4 h-4"/>}>{t('patientDetail.tabs.environment')}</TabButton>
                <TabButton isActive={activeTab === 'observance'} onClick={() => setActiveTab('observance')} icon={<ClipboardList className="w-4 h-4"/>}>{t('patientDetail.tabs.observance')}</TabButton>
                <TabButton isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageCircle className="w-4 h-4"/>}>{t('patientDetail.tabs.chat')}</TabButton>
            </div>
        </div>

        {renderContent()}
      </div>
    );
}