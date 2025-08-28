
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
        const allPatientData = await supabaseService.getDoctorDashboardData(language);
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
  }, [t, language]);

  useEffect(() => {
    async function loadInitialData() {
        setIsLoading(true);
        setError(null);
        try {
            const allPatientData = await supabaseService.getDoctorDashboardData(language);
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
  }, [t, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {t('app.loading')}
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-red-600 bg-red-50 p-4">
            <h2 className="text-xl font-bold mb-2">{t('app.connectionError.title')}</h2>
            <p className="text-center">{error}</p>
            <p className="text-center mt-4 text-sm text-zinc-600">
              {t('app.connectionError.instructions')}
            </p>
        </div>
    );
  }
  
  return (
      <div className="min-h-screen bg-zinc-100 text-zinc-800 font-sans flex flex-col">
        <main className="container mx-auto p-4 lg:p-6 flex-grow">
          <div className="flex flex-col gap-6">
            <header className="bg-gradient-to-br from-white to-zinc-50 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md border border-zinc-200 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                    <Users className="w-8 h-8"/>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800">
                      {t('app.header.title')}
                    </h1>
                    <p className="text-zinc-500">
                      {t('app.header.subtitle')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse border border-zinc-200 p-1 rounded-full">
                    {(['fr', 'en', 'ar'] as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${language === lang ? 'bg-indigo-600 shadow text-white' : 'text-zinc-600 hover:bg-zinc-200/50'}`}
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
        <footer className="w-full text-center py-4 text-zinc-500 text-sm">
            {t('app.footer')}
        </footer>
      </div>
  );
}
