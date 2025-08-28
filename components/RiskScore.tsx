
import React from 'react';
import type { RiskLevel } from '../types';
import { AlertTriangle, ShieldCheck, ShieldAlert } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
}

export function RiskScore({ score, level }: RiskScoreProps): React.ReactNode {
  const { t } = useTranslation();

  const levelInfo = {
    Low: {
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-50',
      icon: <ShieldCheck className="w-8 h-8" />,
      title: t('riskScore.low.title'),
      description: t('riskScore.low.description')
    },
    Medium: {
      bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-50',
      icon: <ShieldAlert className="w-8 h-8" />,
      title: t('riskScore.medium.title'),
      description: t('riskScore.medium.description')
    },
    High: {
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-red-50',
      icon: <AlertTriangle className="w-8 h-8" />,
      title: t('riskScore.high.title'),
      description: t('riskScore.high.description')
    },
  };

  const currentLevel = levelInfo[level];

  return (
    <div className={`col-span-1 md:col-span-3 p-6 rounded-2xl text-white transition-all duration-300 ease-in-out ${currentLevel.bgColor} flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1`}>
        <div className={`mr-4 ml-0 rtl:ml-4 rtl:mr-0 p-3 rounded-full bg-white/20 ${currentLevel.textColor}`}>
            {currentLevel.icon}
        </div>
        <div>
            <h2 className="text-xl font-bold">{currentLevel.title} ({t('riskScore.score', { score })})</h2>
            <p className="text-sm opacity-90">{currentLevel.description}</p>
        </div>
    </div>
  );
}
