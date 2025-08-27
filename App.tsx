
import React, { useState, useEffect, useCallback } from 'react';
import type { PatientData, AlertData } from './types';
import { getMockAlerts } from './services/mockDataService';
import * as supabaseService from './services/supabaseService';
import { DoctorDashboard } from './components/DoctorDashboard';
import { Users } from './components/icons';
import { useTranslation } from './contexts/LanguageContext';
import type { Language } from './contexts/LanguageContext';


export default function App(): React.ReactNode {
  const [allPatients, setAllPatients] = useState<PatientData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    document.title = t('app.title');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [t, language]);

  const refreshDoctorDashboard = useCallback(async () => {
    try {
        const allPatientData = await supabaseService.getDoctorDashboardData();
        setAllPatients(allPatientData);
        setAlerts(getMockAlerts(allPatientData, t));
    } catch (err) {
        console.error("Failed to refresh doctor dashboard data:", err);
         if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(t('app.dashboardLoadError'));
        }
    }
  }, [t]);

  useEffect(() => {
    async function loadInitialData() {
        setIsLoading(true);
        setError(null);
        try {
            const allPatientData = await supabaseService.getDoctorDashboardData();
            setAllPatients(allPatientData);
            setAlerts(getMockAlerts(allPatientData, t));
        } catch (err) {
            console.error(err);
             if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t('app.initialLoadError'));
            }
        } finally {
            setIsLoading(false);
        }
    }
    loadInitialData();
  }, [t]);

  useEffect(() => {
    const unsubscribe = supabaseService.listenToPatientChanges((updatedPatients) => {
        console.log("Real-time update received!");
        setAllPatients(updatedPatients);
        setAlerts(getMockAlerts(updatedPatients, t));
    });

    return () => {
      unsubscribe();
    };
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {t('app.loading')}
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-red-500 bg-red-50 p-4">
            <h2 className="text-xl font-bold mb-2">{t('app.connectionError.title')}</h2>
            <p className="text-center">{error}</p>
            <p className="text-center mt-4 text-sm text-slate-600">
              {t('app.connectionError.instructions')}
            </p>
        </div>
    );
  }
  
  return (
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
        <main className="container mx-auto p-4 lg:p-6 flex-grow">
          <div className="flex flex-col gap-6">
            <header className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="bg-blue-600 p-3 rounded-full text-white">
                    <Users className="w-8 h-8"/>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                      {t('app.header.title')}
                    </h1>
                    <p className="text-slate-600">
                      {t('app.header.subtitle')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-200/80 p-1 rounded-lg">
                    {(['fr', 'en', 'ar'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === lang ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-white/70'}`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
              </div>
            </header>
            <DoctorDashboard patients={allPatients} alerts={alerts} onPatientAdded={refreshDoctorDashboard} />
          </div>
        </main>
        <footer className="w-full text-center py-4 text-slate-500 text-sm">
            {t('app.footer')}
        </footer>
      </div>
  );
}