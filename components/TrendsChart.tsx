
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Measurement } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface TrendsChartProps {
  measurements: Measurement[];
}

/**
 * Calculates the linear regression of a set of data points.
 * @param data - An array of objects with x and y properties.
 * @returns A function that takes an x value and returns the predicted y value, or null if regression can't be calculated.
 */
const calculateLinearRegression = (data: { x: number; y: number }[]) => {
  if (data.length < 2) return null;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  // Avoid division by zero if all x values are the same
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return (x: number) => slope * x + intercept;
};


export function TrendsChart({ measurements }: TrendsChartProps): React.ReactNode {
  const { t, language } = useTranslation();
  const locale = language === 'ar' ? 'ar-EG' : language;

  const dataForChart = measurements.map((m, index) => ({
    time: new Date(m.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    SpO2: m.spo2,
    heartRate: m.heartRate,
    index: index,
  }));

  // Calculate regression for SpO2
  const spo2RegressionData = dataForChart.map(d => ({ x: d.index, y: d.SpO2 }));
  const spo2RegressionFn = calculateLinearRegression(spo2RegressionData);

  // Calculate regression for Heart Rate
  // FIX: Use static 'heartRate' key for calculation to ensure 'y' is a number.
  const hrRegressionData = dataForChart.map(d => ({ x: d.index, y: d.heartRate }));
  const hrRegressionFn = calculateLinearRegression(hrRegressionData);

  // Add trend data to the chart data
  const dataWithTrend = dataForChart.map(d => ({
    ...d,
    [t('trendsChart.spo2Trend')]: spo2RegressionFn ? parseFloat(spo2RegressionFn(d.index).toFixed(1)) : null,
    [t('trendsChart.hrTrend')]: hrRegressionFn ? parseFloat(hrRegressionFn(d.index).toFixed(1)) : null,
  }));
  
  const tooltipFormatter = (value: number, name: string) => {
    if (name.includes(t('trendsChart.spo2')) || name === 'SpO2') {
      return [`${value}%`, name];
    }
    if (name.includes(t('trendsChart.heartRate')) || name.includes(t('trendsChart.hrTrend'))) {
      return [`${value} bpm`, name];
    }
    return [`${value}`, name];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dataWithTrend} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" stroke="#71717a" fontSize={12} />
        <YAxis yAxisId="left" stroke="#4f46e5" domain={[85, 100]} fontSize={12} label={{ value: t('trendsChart.ySpo2'), angle: -90, position: 'insideLeft', offset: 0, style: {fontSize: '12px', fill: '#4f46e5'}}} />
        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[50, 120]} fontSize={12} label={{ value: t('trendsChart.yHr'), angle: 90, position: 'insideRight', offset: 0, style: {fontSize: '12px', fill: '#ef4444'}}}/>
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }}
            formatter={tooltipFormatter}
        />
        <Legend wrapperStyle={{fontSize: "12px"}}/>
        {/* Actual Data Lines */}
        <Line yAxisId="left" type="monotone" dataKey="SpO2" name={t('trendsChart.spo2')} stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        <Line yAxisId="right" type="monotone" dataKey="heartRate" name={t('trendsChart.heartRate')} stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        
        {/* Trend Lines */}
        {spo2RegressionFn && (
          <Line
            yAxisId="left"
            type="linear"
            dataKey={t('trendsChart.spo2Trend')}
            name={t('trendsChart.spo2Trend')}
            stroke="#818cf8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
          />
        )}
        {hrRegressionFn && (
          <Line
            yAxisId="right"
            type="linear"
            dataKey={t('trendsChart.hrTrend')}
            name={t('trendsChart.hrTrend')}
            stroke="#f87171"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}