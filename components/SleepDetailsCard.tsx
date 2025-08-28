
import React from 'react';
import type { SleepData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BedDouble, BarChart as BarChartIcon, Wind, PersonStanding } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface SleepDetailsCardProps {
  data: SleepData;
}

const StatCard = ({ label, value, unit, icon }: { label: string, value: string | number, unit: string, icon: React.ReactNode }) => (
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


export function SleepDetailsCard({ data }: SleepDetailsCardProps): React.ReactNode {
  const { t } = useTranslation();

  const totalMinutes = data.totalSleepHours * 60;
  // S'assurer que le sommeil léger ne soit pas négatif si les données sont incohérentes
  const lightSleepMinutes = Math.max(0, totalMinutes - data.deepSleepMinutes - data.remSleepMinutes - data.awakeMinutes);
  
  const phaseDeep = t('sleepDetails.phases.deep');
  const phaseRem = t('sleepDetails.phases.rem');
  const phaseLight = t('sleepDetails.phases.light');
  const phaseAwake = t('sleepDetails.phases.awake');

  const sleepCompositionData = [
    {
      name: 'Composition',
      [phaseDeep]: data.deepSleepMinutes,
      [phaseRem]: data.remSleepMinutes,
      [phaseLight]: lightSleepMinutes,
      [phaseAwake]: data.awakeMinutes,
    },
  ];

  const COLORS = {
    [phaseDeep]: '#3b82f6',
    [phaseRem]: '#8b5cf6',
    [phaseLight]: '#a78bfa',
    [phaseAwake]: '#f59e0b'
  };

  const translatePosition = (pos: "supine" | "lateral" | "prone" | "sitting") => {
    return t(`smartphone.sleep.positions.${pos}`);
  };

  const legendFormatter = (value: string) => (
    <span style={{ marginLeft: '4px', marginRight: '12px', color: '#374151' }}>{value}</span>
  );


  return (
    <div>
        <h3 className="text-md font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-600"/>
            {t('sleepDetails.title')}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label={t('sleepDetails.totalSleep')} value={data.totalSleepHours.toFixed(1)} unit={t('units.h')} icon={<BedDouble className="w-5 h-5" />} />
            {/* FIX: Corrected property 'efficiency' to 'sleepEfficiency' to match the SleepData type. */}
            <StatCard label={t('sleepDetails.efficiency')} value={data.sleepEfficiency} unit="%" icon={<BarChartIcon className="w-5 h-5" />} />
            {/* FIX: Corrected property 'movements' to 'nightMovements' to match the SleepData type. */}
            <StatCard label={t('sleepDetails.movements')} value={data.nightMovements} unit={t('units.times')} icon={<Wind className="w-5 h-5" />} />
            <StatCard label={t('sleepDetails.position')} value={translatePosition(data.sleepPosition)} unit="" icon={<PersonStanding className="w-5 h-5" />} />
        </div>
        
        <div>
            <h4 className="text-sm font-semibold text-zinc-600 mb-2">{t('sleepDetails.compositionTitle')}</h4>
            <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={sleepCompositionData}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 0, bottom: 20 }}
                        barCategoryGap="20%"
                    >
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip
                             contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.75rem',
                            }}
                            cursor={{fill: 'transparent'}}
                        />
                        <Legend
                            formatter={legendFormatter}
                            wrapperStyle={{ position: 'relative', marginTop: '10px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Bar dataKey={phaseDeep} stackId="a" fill={COLORS[phaseDeep]} />
                        <Bar dataKey={phaseRem} stackId="a" fill={COLORS[phaseRem]} />
                        <Bar dataKey={phaseLight} stackId="a" fill={COLORS[phaseLight]} />
                        <Bar dataKey={phaseAwake} stackId="a" fill={COLORS[phaseAwake]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

    </div>
  );
}
