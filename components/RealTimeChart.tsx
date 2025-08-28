
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CompletePrediction } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface RealTimeChartProps {
  activityData: CompletePrediction['activityData'];
}

export function RealTimeChart({ activityData }: RealTimeChartProps): React.ReactNode {
  const { t } = useTranslation();

  const stepsKey = t('realTimeChart.steps');
  const activeMinutesKey = t('realTimeChart.activeMinutes');

  const data = activityData.map(d => ({
    ...d,
    [stepsKey]: d.steps,
    [activeMinutesKey]: d.activeMinutes
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
        <defs>
            <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" stroke="#a1a1aa" fontSize={11} interval={5}/>
        <YAxis yAxisId="left" stroke="#4f46e5" fontSize={11} />
        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
            }}
            labelFormatter={(label: string) => t('realTimeChart.label', { label })}
        />
        <Legend wrapperStyle={{fontSize: "12px"}}/>
        <Area yAxisId="left" type="monotone" dataKey={stepsKey} name={stepsKey} stroke="#4f46e5" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={2} />
        <Area yAxisId="right" type="monotone" dataKey={activeMinutesKey} name={activeMinutesKey} stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}