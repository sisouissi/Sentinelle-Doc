import React, { useState, useEffect } from 'react';
import type { PatientData, WeatherData, WeatherImpactAnalysis } from '../types';
import { getWeatherForPatient } from '../services/weatherService';
import { analyzeWeatherImpact } from '../services/geminiService';
import { Thermometer, Droplets, Wind, Cloudy, Leaf, Sun, BrainCircuit, AlertTriangle } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface EnvironmentTabProps {
    patient: PatientData;
}

const WeatherCard = ({ label, value, unit, icon }: { label: string, value: string | number, unit: string, icon: React.ReactNode }) => (
    <div className="p-3 rounded-lg flex items-center gap-3 bg-slate-100/70">
        <div className="flex-shrink-0 text-slate-500">{icon}</div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-base font-bold text-slate-800">
                {value} <span className="text-sm font-normal text-slate-600">{unit}</span>
            </p>
        </div>
    </div>
);

const ImpactCard = ({ analysis, t }: { analysis: WeatherImpactAnalysis, t: (key: string) => string }) => {
    const getImpactColor = (level: 'Low' | 'Medium' | 'High') => {
        if (level === 'High') return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500' };
        if (level === 'Medium') return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-500' };
        return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-500' };
    };

    const colors = getImpactColor(analysis.impactLevel);

    const translateLevel = (level: 'Low' | 'Medium' | 'High') => {
        return t(`environment.impact.levels.${level}`);
    };

    return (
        <div className={`p-4 rounded-xl border-l-4 rtl:border-l-0 rtl:border-r-4 ${colors.border} ${colors.bg}`}>
            <div className="flex items-center justify-between mb-2">
                 <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-blue-600" />
                    {t('environment.impact.title')}
                </h4>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {translateLevel(analysis.impactLevel)}
                </span>
            </div>
            <p className="text-sm text-slate-700">
                {analysis.summary}
            </p>
        </div>
    );
};


export function EnvironmentTab({ patient }: EnvironmentTabProps): React.ReactNode {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [analysis, setAnalysis] = useState<WeatherImpactAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, language } = useTranslation();

    useEffect(() => {
        const fetchEnvironmentData = async () => {
            setIsLoading(true);
            setError(null);

            if (!patient.city || !patient.country) {
                setError(t('environment.errorLocation'));
                setIsLoading(false);
                return;
            }
            
            try {
                const weatherData = await getWeatherForPatient(patient, language);
                setWeather(weatherData);
                const impactAnalysis = await analyzeWeatherImpact(patient, weatherData, language);
                setAnalysis(impactAnalysis);
            } catch (err) {
                console.error("Failed to fetch environment data:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred while loading environmental data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnvironmentData();
    }, [patient, t, language]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('environment.loading')}</span>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm animate-fade-in">
                <div className="flex flex-col items-center justify-center text-center py-10 text-red-700 bg-red-50/80 p-4 rounded-lg">
                    <AlertTriangle className="w-8 h-8 mb-3" />
                    <h4 className="font-semibold mb-2">{t('environment.errorTitle')}</h4>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!weather || !analysis) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm animate-fade-in">
                <div className="text-center py-10 text-slate-500">
                    <p>{t('environment.errorGeneric')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm animate-fade-in">
             <h3 className="text-md font-semibold text-slate-700 mb-4">
                {t('environment.title', { location: weather.location })}
             </h3>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="grid grid-cols-2 gap-3">
                    <WeatherCard label={t('environment.weather.temperature')} value={weather.temperature} unit="°C" icon={<Thermometer className="w-5 h-5" />} />
                    <WeatherCard label={t('environment.weather.humidity')} value={weather.humidity} unit="%" icon={<Droplets className="w-5 h-5" />} />
                    <WeatherCard label={t('environment.weather.aqi')} value={weather.airQualityIndex} unit="IQA" icon={<Cloudy className="w-5 h-5" />} />
                    <WeatherCard label={t('environment.weather.wind')} value={weather.windSpeed} unit="km/h" icon={<Wind className="w-5 h-5" />} />
                    <WeatherCard label={t('environment.weather.pollen')} value={weather.pollenLevel} unit="" icon={<Leaf className="w-5 h-5" />} />
                    <WeatherCard label={t('environment.weather.uv')} value={weather.uvIndex} unit="/ 10" icon={<Sun className="w-5 h-5" />} />
                </div>

                <div className="space-y-4">
                    <ImpactCard analysis={analysis} t={t} />
                </div>
             </div>
        </div>
    );
}