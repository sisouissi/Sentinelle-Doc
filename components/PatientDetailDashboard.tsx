import React, { useState, useEffect, useCallback } from 'react';
import type { PatientData, CompletePrediction, ChatMessage } from '../types';
import * as supabaseService from '../services/supabaseService';
import { predictionService } from '../services/predictionService';
import { ArrowLeft, BrainCircuit, MessageCircle, HeartPulse, ClipboardList, Cloudy, AudioLines, SmokingOff } from './icons';
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
import { SpeechAnalysisTab } from './SpeechAnalysisTab';
import { SmokingCessationTab } from './SmokingCessationTab';
import { useTranslation } from '../contexts/LanguageContext';

interface PatientDetailDashboardProps {
  patient: PatientData;
  onBack: () => void;
}

const LoadingState: React.FC<{text: string}> = ({text}) => (
    <div className="flex items-center justify-center h-full text-zinc-500 py-10">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);

const TabButton = ({ isActive, onClick, children, icon }: { isActive: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-300 ${
        isActive
          ? 'bg-white shadow text-indigo-600'
          : 'text-zinc-600 hover:bg-white/60 hover:text-zinc-800'
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {icon}
      <span className="hidden md:inline">{children}</span>
    </button>
);


type ActiveDetailTab = 'prediction' | 'vitals' | 'environnement' | 'observance' | 'chat' | 'speech' | 'smoking';

export function PatientDetailDashboard({ patient, onBack }: PatientDetailDashboardProps): React.ReactNode {
    const [prediction, setPrediction] = useState<CompletePrediction | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[] | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveDetailTab>('prediction');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isRefreshingPrediction, setIsRefreshingPrediction] = useState(false);
    const { t, language } = useTranslation();

    const handleRefreshPrediction = useCallback(async () => {
        setIsRefreshingPrediction(true);
        try {
            await predictionService.refreshPrediction();
        } catch (error) {
            console.error("Failed to refresh prediction:", error);
            // Optionally: set an error state to show in the UI
        } finally {
            setIsRefreshingPrediction(false);
        }
    }, []);

    useEffect(() => {
        setPrediction(null);
        setChatHistory(null);
        setActiveTab('prediction');
        
        predictionService.startService(patient.id, language, t);
        const unsubscribePrediction = predictionService.onUpdate(setPrediction);

        return () => {
            unsubscribePrediction();
            predictionService.stopService();
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
            return (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in">
                    <div className="xl:col-span-1 space-y-5">
                       <PredictionCard
                            prediction={prediction}
                            onRefresh={handleRefreshPrediction}
                            isRefreshing={isRefreshingPrediction}
                       />
                       {prediction && <AlertsTimeline alerts={prediction.alerts} />}
                    </div>
                    {prediction ? (
                        <div className="xl:col-span-2 space-y-5">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-72 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                               <h3 className="text-md font-semibold text-zinc-700 mb-2">{t('patientDetail.hourlyActivity')}</h3>
                               <RealTimeChart activityData={prediction.activityData} />
                            </div>
                             <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                               <LocationHeatmap heatmapData={prediction.heatmapData} />
                            </div>
                        </div>
                    ) : (
                        <div className="xl:col-span-2 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl h-full shadow-sm">
                           <div className="text-center text-zinc-500 p-4">
                               <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                               <p className="font-semibold">{t('prediction.clickToAnalyze.title')}</p>
                               <p className="text-sm max-w-xs">{t('prediction.clickToAnalyze.description')}</p>
                           </div>
                       </div>
                    )}
                </div>
            )
        }
        if (activeTab === 'vitals') {
            return (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in">
                    <div className="xl:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-96 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                        <h3 className="text-md font-semibold text-zinc-700 mb-2">{t('patientDetail.vitalsMonitoring')}</h3>
                        <TrendsChart measurements={patient.measurements} />
                    </div>
                    <div className="xl:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
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
                    <div className="text-center py-10 text-zinc-500 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
                        <p>{t('patientDetail.noChatHistory')}</p>
                    </div>
                );
            }
            return <ChatHistoryViewer history={chatHistory} />;
        }
        if (activeTab === 'speech') {
            return <SpeechAnalysisTab speechData={patient.smartphone.speech} />;
        }
        if (activeTab === 'smoking') {
            return <SmokingCessationTab 
                smokingData={patient.smartphone.reported.smoking} 
                logs={patient.smoking_cessation_logs} 
            />;
        }
    };

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4 font-semibold">
                <ArrowLeft className="w-4 h-4" /> {t('app.header.title')}
            </button>
            <div className="flex flex-col gap-6">
                <PatientInfoCard patient={patient} />
                
                <div className="flex flex-col gap-5">
                    <div className="bg-zinc-200/70 p-1 rounded-xl">
                        <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs" role="tablist">
                            <TabButton isActive={activeTab === 'prediction'} onClick={() => setActiveTab('prediction')} icon={<BrainCircuit className="w-5 h-5"/>}>{t('patientDetail.tabs.prediction')}</TabButton>
                            <TabButton isActive={activeTab === 'vitals'} onClick={() => setActiveTab('vitals')} icon={<HeartPulse className="w-5 h-5"/>}>{t('patientDetail.tabs.vitals')}</TabButton>
                            <TabButton isActive={activeTab === 'environnement'} onClick={() => setActiveTab('environnement')} icon={<Cloudy className="w-5 h-5"/>}>{t('patientDetail.tabs.environment')}</TabButton>
                            <TabButton isActive={activeTab === 'speech'} onClick={() => setActiveTab('speech')} icon={<AudioLines className="w-5 h-5"/>}>{t('patientDetail.tabs.speech')}</TabButton>
                            <TabButton isActive={activeTab === 'smoking'} onClick={() => setActiveTab('smoking')} icon={<SmokingOff className="w-5 h-5"/>}>{t('patientDetail.tabs.smoking')}</TabButton>
                            <TabButton isActive={activeTab === 'observance'} onClick={() => setActiveTab('observance')} icon={<ClipboardList className="w-5 h-5"/>}>{t('patientDetail.tabs.observance')}</TabButton>
                            <TabButton isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageCircle className="w-5 h-5"/>}>{t('patientDetail.tabs.chat')}</TabButton>
                        </nav>
                    </div>

                    <div>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}