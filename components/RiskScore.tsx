
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
      bgColor: 'bg-green-500',
      textColor: 'text-green-50',
      icon: <ShieldCheck className="w-8 h-8" />,
      title: t('riskScore.low.title'),
      description: t('riskScore.low.description')
    },
    Medium: {
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-50',
      icon: <ShieldAlert className="w-8 h-8" />,
      title: t('riskScore.medium.title'),
      description: t('riskScore.medium.description')
    },
    High: {
      bgColor: 'bg-red-500',
      textColor: 'text-red-50',
      icon: <AlertTriangle className="w-8 h-8" />,
      title: t('riskScore.high.title'),
      description: t('riskScore.high.description')
    },
  };

  const currentLevel = levelInfo[level];

  return (
    <div className={`col-span-1 md:col-span-3 p-6 rounded-2xl text-white transition-all duration-300 ${currentLevel.bgColor} flex items-center shadow-lg`}>
        <div className={`mr-4 ml-0 rtl:ml-4 rtl:mr-0 p-3 rounded-full bg-white/20 ${currentLevel.textColor}`}>
            {currentLevel.icon}
        </div>
        <div>
            <h2 className="text-xl font-bold">{currentLevel.title} ({t('riskScore.score', { score })})</h2>
            <p className="text-sm">{currentLevel.description}</p>
        </div>
    </div>
  );
}
