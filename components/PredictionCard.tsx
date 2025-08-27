import React from 'react';
import type { CompletePrediction } from '../types';
import { BrainCircuit, TrendingDown, Cloudy, Lungs, BedDouble, Footprints } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

const FactorIcon = ({ name }: { name: string }) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spo')) return <Lungs className="w-5 h-5 text-blue-500" />;
    if (lowerName.includes('mobilité') || lowerName.includes('pas') || lowerName.includes('mobility') || lowerName.includes('steps')) return <Footprints className="w-5 h-5 text-green-500" />;
    if (lowerName.includes('sommeil') || lowerName.includes('sleep')) return <BedDouble className="w-5 h-5 text-purple-500" />;
    if (lowerName.includes('toux') || lowerName.includes('cough')) return <Lungs className="w-5 h-5 text-yellow-600" />;
    if (lowerName.includes('météo') || lowerName.includes('environnement') || lowerName.includes('air') || lowerName.includes('weather') || lowerName.includes('environment')) return <Cloudy className="w-5 h-5 text-slate-500" />;
    return <TrendingDown className="w-5 h-5 text-red-500" />;
}

export function PredictionCard({ prediction }: { prediction: CompletePrediction }): React.ReactNode {
    const { t } = useTranslation();
    const { riskScore, confidence, contributingFactors, recommendations } = prediction;

    const getRiskColor = (score: number) => {
        if (score > 70) return 'text-red-500';
        if (score > 40) return 'text-yellow-500';
        return 'text-green-500';
    }

    const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
        if (impact === 'high') return 'bg-red-200 text-red-800';
        if (impact === 'medium') return 'bg-yellow-200 text-yellow-800';
        return 'bg-green-200 text-green-800';
    }

    const translateImpact = (impact: 'high' | 'medium' | 'low') => {
        return t(`prediction.impacts.${impact}`);
    }
    
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                {t('prediction.title')}
            </h3>

            <div className="text-center my-4">
                <p className="text-sm text-slate-500">{t('prediction.riskScore')}</p>
                <p className={`text-6xl font-bold ${getRiskColor(riskScore)}`}>
                    {riskScore}
                    <span className="text-4xl">%</span>
                </p>
                <p className="text-xs text-slate-400">{t('prediction.confidence', { confidence })}</p>
            </div>
            
            <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-2">{t('prediction.factors')}</h4>
                <div className="space-y-2">
                    {contributingFactors.map((factor, index) => (
                        <div key={index} className="bg-slate-100/70 p-2.5 rounded-lg">
                           <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FactorIcon name={factor.name} />
                                    <span className="text-sm font-medium text-slate-800">{factor.name}</span>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getImpactColor(factor.impact)}`}>
                                    {translateImpact(factor.impact)}
                                </span>
                           </div>
                           <p className="text-xs text-slate-500 mt-1 ltr:pl-7 rtl:pr-7">{factor.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">{t('prediction.recommendations')}</h4>
                <ul className="space-y-1.5 list-disc ltr:list-inside rtl:list-outside rtl:mr-4 text-sm text-slate-700">
                    {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}