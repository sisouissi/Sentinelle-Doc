import React from 'react';
import type { HeatmapDataPoint } from '../types';
import { TrendingUp, TrendingDown, Activity, Map } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface LocationHeatmapProps {
  heatmapData: HeatmapDataPoint[];
}

const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-100/80';
    // Blue (cold) to Red (hot) gradient for activity
    const hue = (1 - value) * 240;
    const lightness = 60 + value * 15;
    return `hsl(${hue}, 90%, ${lightness}%)`;
};

const SingleHeatmap = ({ dayLabel, data }: HeatmapDataPoint) => (
  <div className="flex-1 min-w-[120px]">
    <h4 className="text-sm font-semibold text-slate-600 mb-2 text-center">{dayLabel}</h4>
    <div className="grid grid-cols-12 gap-0.5">
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-full aspect-square rounded-sm"
            style={{ backgroundColor: getColor(value) }}
            title={`Activité: ${Math.round(value * 100)}%`}
          ></div>
        ))
      )}
    </div>
  </div>
);

const InterpretationCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="bg-slate-100/70 p-3 rounded-lg flex items-start gap-3">
        <div className="flex-shrink-0 mt-1 text-blue-600">{icon}</div>
        <div>
            <h5 className="font-semibold text-slate-800 text-sm">{title}</h5>
            <p className="text-xs text-slate-600">{text}</p>
        </div>
    </div>
);

export function LocationHeatmap({ heatmapData }: LocationHeatmapProps): React.ReactNode {
    const { t } = useTranslation();

    const getTrendAnalysis = () => {
        if (heatmapData.length < 2) {
            return { trend: 'stable', textKey: "locationHeatmap.trends.insufficient" };
        }
        const totalActivities = heatmapData.map(day => 
            day.data.flat().reduce((sum, val) => sum + val, 0)
        );
        // heatmapData is [today, yesterday, day-before]
        const today = totalActivities[0];
        const yesterday = totalActivities[1];

        if (today > yesterday * 1.15) { // 15% increase
            return { trend: 'up', textKey: "locationHeatmap.trends.up" };
        }
        if (today < yesterday * 0.85) { // 15% decrease
            return { trend: 'down', textKey: "locationHeatmap.trends.down" };
        }
        return { trend: 'stable', textKey: "locationHeatmap.trends.stable" };
    };

    const getPatternAnalysis = () => {
        const todayData = heatmapData[0].data;
        const activeCells = todayData.flat().filter(v => v > 0).length;
        const totalCells = todayData.length * todayData[0].length;
        const activityRatio = activeCells / totalCells;

        if (activityRatio > 0.25) { // >25% of cells active
            return { textKey: "locationHeatmap.patterns.dispersed" };
        }
        if (activityRatio < 0.1) { // <10%
            return { textKey: "locationHeatmap.patterns.localized" };
        }
        return { textKey: "locationHeatmap.patterns.moderate" };
    };

    const trendAnalysis = getTrendAnalysis();
    const patternAnalysis = getPatternAnalysis();

    const TrendIcon = {
        up: <TrendingUp className="w-6 h-6 text-green-500" />,
        down: <TrendingDown className="w-6 h-6 text-red-500" />,
        stable: <Activity className="w-6 h-6 text-blue-500" />,
    }[trendAnalysis.trend];

    return (
        <div>
            <h3 className="text-md font-semibold text-slate-700 mb-3">{t('locationHeatmap.title')}</h3>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                {heatmapData.map(day => (
                    <SingleHeatmap key={day.dayLabel} dayLabel={day.dayLabel} data={day.data} />
                ))}
            </div>

            <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-slate-500">
                <span>{t('locationHeatmap.legendLow')}</span>
                <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-500"></div>
                <span>{t('locationHeatmap.legendHigh')}</span>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InterpretationCard 
                    icon={TrendIcon}
                    title={t('locationHeatmap.trendTitle')}
                    text={t(trendAnalysis.textKey)}
                />
                <InterpretationCard 
                    icon={<Map className="w-6 h-6 text-purple-500" />}
                    title={t('locationHeatmap.patternTitle')}
                    text={t(patternAnalysis.textKey)}
                />
            </div>
        </div>
    );
}