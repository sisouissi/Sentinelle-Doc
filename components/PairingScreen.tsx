import React, { useState } from 'react';
import { getPatientByCode } from '../services/supabaseService';
import type { PatientData } from '../types';
import { HeartPulse, Key, AlertTriangle } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface PairingScreenProps {
  onPairSuccess: (patient: PatientData) => void;
}

export function PairingScreen({ onPairSuccess }: PairingScreenProps): React.ReactNode {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(t('pairing.errorRequired'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const patient = await getPatientByCode(code.trim());
      if (patient) {
        onPairSuccess(patient);
      } else {
        setError(t('pairing.errorInvalid'));
      }
    } catch (err) {
      console.error(err);
      setError(t('pairing.errorConnection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm animate-fade-in">
        <div className="text-center">
            <div className="bg-blue-600 inline-block p-4 rounded-full text-white mb-4">
              <HeartPulse className="w-10 h-10"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{t('pairing.welcome')}</h2>
            <p className="mt-2 text-slate-600">{t('pairing.instructions')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm">
            <div>
                <label htmlFor="pairing-code" className="block text-sm font-medium text-slate-700">
                    {t('pairing.label')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="pairing-code"
                        id="pairing-code"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 rtl:pl-4 rtl:pr-10 sm:text-lg border-gray-300 rounded-md py-3 uppercase"
                        placeholder={t('pairing.placeholder')}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoCapitalize="characters"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-wait"
                >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('pairing.loadingButton')}
                    </>
                ) : (
                    t('pairing.button')
                )}
                </button>
            </div>
        </form>
    </div>
  );
}