import React from 'react';
import type { CompletePrediction } from '../types';
import { BrainCircuit, TrendingDown, Cloudy, Lungs, BedDouble, Footprints, RefreshCw, AlertTriangle, Bot } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

const FactorIcon = ({ name }: { name: string }) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spo')) return <Lungs className="w-5 h-5 text-indigo-500" />;
    if (lowerName.includes('mobilité') || lowerName.includes('pas') || lowerName.includes('mobility') || lowerName.includes('steps')) return <Footprints className="w-5 h-5 text-green-500" />;
    if (lowerName.includes('sommeil') || lowerName.includes('sleep')) return <BedDouble className="w-5 h-5 text-purple-500" />;
    if (lowerName.includes('toux') || lowerName.includes('cough')) return <Lungs className="w-5 h-5 text-yellow-600" />;
    if (lowerName.includes('météo') || lowerName.includes('environnement') || lowerName.includes('air') || lowerName.includes('weather') || lowerName.includes('environment')) return <Cloudy className="w-5 h-5 text-zinc-500" />;
    return <TrendingDown className="w-5 h-5 text-red-500" />;
}

interface PredictionCardProps {
    prediction: CompletePrediction | null;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function PredictionCard({ prediction, onRefresh, isRefreshing }: PredictionCardProps): React.ReactNode {
    const { t } = useTranslation();

    if (isRefreshing && !prediction) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 h-full flex flex-col items-center justify-center text-zinc-500 min-h-[400px]">
                 <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-3">{t('patientDetail.loadingPrediction')}</p>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 text-center flex flex-col justify-center h-full min-h-[400px] transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <BrainCircuit className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
                <h3 className="text-md font-semibold text-zinc-700">
                    {t('prediction.clickToAnalyze.title')}
                </h3>
                <p className="text-sm text-zinc-500 my-2">
                    {t('prediction.clickToAnalyze.description')}
                </p>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow hover:shadow-md disabled:bg-indigo-400 disabled:cursor-wait"
                >
                    {t('prediction.clickToAnalyze.button')}
                </button>
            </div>
        )
    }
    
    const { riskScore, confidence, summary, contributingFactors, recommendations, error } = prediction;

    const getRiskGradient = (score: number) => {
        if (score > 70) return 'from-red-500 to-red-700';
        if (score > 40) return 'from-yellow-500 to-yellow-600';
        return 'from-green-500 to-green-600';
    }

    const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
        if (impact === 'high') return 'bg-red-100 text-red-800';
        if (impact === 'medium') return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    }

    const translateImpact = (impact: 'high' | 'medium' | 'low') => {
        return t(`prediction.impacts.${impact}`);
    }
    
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-zinc-700 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    {t('prediction.title')}
                </h3>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Rafraîchir l'analyse de prédiction"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                 <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                    <div>
                        <p className="font-semibold text-red-800">{t('prediction.errors.analysisFailed')}</p>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {!error && (
                <>
                    <div className="text-center my-4">
                        <p className="text-sm text-zinc-500">{t('prediction.riskScore')}</p>
                        <p className={`text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${getRiskGradient(riskScore)}`}>
                            {riskScore}
                            <span className="text-4xl text-zinc-400">%</span>
                        </p>
                        <p className="text-xs text-zinc-400">{t('prediction.confidence', { confidence })}</p>
                    </div>

                    {summary && (
                        <div className="mb-4 p-3 bg-indigo-50/70 rounded-lg">
                            <h4 className="text-sm font-semibold text-zinc-600 mb-1.5 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-indigo-600" />
                                {t('prediction.synthesisTitle')}
                            </h4>
                            <p className="text-sm text-zinc-700">{summary}</p>
                        </div>
                    )}
                    
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-600 mb-2">{t('prediction.factors')}</h4>
                        <div className="space-y-2">
                            {(contributingFactors || []).map((factor, index) => (
                                <div key={index} className="bg-zinc-100/70 p-2.5 rounded-lg transition-colors duration-200 hover:bg-zinc-200/50">
                                <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FactorIcon name={factor.name} />
                                            <span className="text-sm font-medium text-zinc-800">{factor.name}</span>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getImpactColor(factor.impact)}`}>
                                            {translateImpact(factor.impact)}
                                        </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1 ltr:pl-7 rtl:pr-7">{factor.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="text-sm font-semibold text-zinc-600 mb-2">{t('prediction.recommendations')}</h4>
                        <ul className="space-y-1.5 list-disc ltr:list-inside rtl:list-outside rtl:mr-4 text-sm text-zinc-700">
                            {(recommendations || []).map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}