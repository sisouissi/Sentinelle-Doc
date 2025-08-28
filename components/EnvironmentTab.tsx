import React, { useState, useEffect } from 'react';
import type { PatientData, WeatherData, WeatherImpactAnalysis } from '../types';
import { getWeatherForPatient } from '../services/weatherService';
import { analyzeWeatherImpact } from '../services/geminiService';
import { Thermometer, Droplets, Wind, Cloudy, Leaf, Sun, BrainCircuit, AlertTriangle, RefreshCw } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface EnvironmentTabProps {
    patient: PatientData;
}

const WeatherCard = ({ label, value, unit, icon }: { label: string, value: string | number, unit: string, icon: React.ReactNode }) => (
    <div className="p-3 rounded-lg flex items-center gap-3 bg-zinc-100/70 transition-transform duration-200 hover:scale-105 hover:shadow-sm">
        <div className="flex-shrink-0 text-zinc-500">{icon}</div>
        <div>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-base font-bold text-zinc-800">
                {value} <span className="text-sm font-normal text-zinc-600">{unit}</span>
            </p>
        </div>
    </div>
);

const ImpactCard = ({ analysis, t, onRefresh, isRefreshing }: { analysis: WeatherImpactAnalysis, t: (key: string, options?: any) => string, onRefresh: () => void, isRefreshing: boolean }) => {
    const getImpactColor = (level: 'Low' | 'Medium' | 'High') => {
        if (level === 'High') return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500' };
        if (level === 'Medium') return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-500' };
        return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-500' };
    };

    const translateLevel = (level: 'Low' | 'Medium' | 'High') => {
        return t(`environment.impact.levels.${level}`);
    };

    if (analysis.error) {
        return (
            <div className={`p-4 rounded-xl border-l-4 rtl:border-l-0 rtl:border-r-4 transition-all duration-200 hover:shadow-md border-red-500 bg-red-100`}>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        {t('environment.impact.analysisFailed')}
                    </h4>
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-full text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Rafraîchir l'analyse d'impact"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <p className="text-sm text-red-700">
                    {analysis.error}
                </p>
            </div>
        );
    }
    
    const colors = getImpactColor(analysis.impactLevel);

    return (
        <div className={`p-4 rounded-xl border-l-4 rtl:border-l-0 rtl:border-r-4 transition-all duration-200 hover:shadow-md ${colors.border} ${colors.bg}`}>
            <div className="flex items-center justify-between mb-2">
                 <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    {t('environment.impact.title')}
                </h4>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                        {translateLevel(analysis.impactLevel)}
                    </span>
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-full text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Rafraîchir l'analyse d'impact"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            <p className="text-sm text-zinc-700">
                {analysis.summary}
            </p>
        </div>
    );
};


export function EnvironmentTab({ patient }: EnvironmentTabProps): React.ReactNode {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [analysis, setAnalysis] = useState<WeatherImpactAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t, language } = useTranslation();

    useEffect(() => {
        // Reset state when patient changes
        setWeather(null);
        setAnalysis(null);
        setError(null);
        setIsLoading(false);
    }, [patient.id]);
    
    const handleLoadAndAnalyze = async () => {
        setIsLoading(true);
        setError(null);

        if (!patient.city || !patient.country) {
            setError(t('environment.errorLocation'));
            setIsLoading(false);
            return;
        }
        
        try {
            const weatherData = await getWeatherForPatient(patient, language);
            setWeather(weatherData); // Show weather info as soon as it's available

            const impactAnalysis = await analyzeWeatherImpact(patient, weatherData, language);
            setAnalysis(impactAnalysis);
        } catch (err) {
             console.error("Failed to fetch environment data or analyze impact:", err);
             if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while loading environmental data.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderInitialState = () => (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-full flex items-center justify-center">
             <div className="border-2 border-dashed border-zinc-300 rounded-xl text-center flex flex-col items-center justify-center p-6 w-full">
                 <Cloudy className="w-10 h-10 text-indigo-500 mb-3" />
                 <h3 className="text-md font-semibold text-zinc-700">
                     {t('environment.impact.launchAnalysis')}
                 </h3>
                 <p className="text-sm text-zinc-500 my-2 max-w-xs">
                     {t('environment.impact.launchDescription')}
                 </p>
                 <button
                     onClick={handleLoadAndAnalyze}
                     disabled={isLoading}
                     className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow hover:shadow-md disabled:bg-indigo-400 disabled:cursor-wait"
                 >
                     {t('prediction.clickToAnalyze.button')}
                 </button>
             </div>
        </div>
    );

    if (isLoading && !weather) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('environment.loading')}</span>
            </div>
        );
    }
    
    if (error && !weather) {
         return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 animate-fade-in">
                <div className="flex flex-col items-center justify-center text-center py-10 text-red-700 bg-red-50/80 p-4 rounded-lg">
                    <AlertTriangle className="w-8 h-8 mb-3" />
                    <h4 className="font-semibold mb-2">{t('environment.errorTitle')}</h4>
                    <p className="text-sm">{error}</p>
                    <button onClick={handleLoadAndAnalyze} className="mt-4 px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }
    
    if (!weather) {
       return renderInitialState();
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 animate-fade-in transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
             <h3 className="text-md font-semibold text-zinc-700 mb-4">
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
                    {analysis ? (
                        <ImpactCard analysis={analysis} t={t} onRefresh={handleLoadAndAnalyze} isRefreshing={isLoading} />
                    ) : (
                         <div className="bg-zinc-100/70 p-4 rounded-xl border-2 border-dashed border-zinc-300 text-center flex flex-col items-center justify-center h-full">
                           <p className="text-sm text-zinc-600">L'analyse de l'impact IA est disponible.</p>
                           <button onClick={handleLoadAndAnalyze} disabled={isLoading} className="mt-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                Rafraîchir l'analyse
                           </button>
                        </div>
                    )}
                     {error && !analysis?.error && <p className="text-xs text-red-500 mt-2 text-center p-2 bg-red-50 rounded">{error}</p>}
                </div>
             </div>
        </div>
    );
}