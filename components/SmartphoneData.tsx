
import React, { useState, useMemo } from 'react';
import type { SmartphoneData as SmartphoneDataType } from '../types';
import { Footprints, BedDouble, Cloudy, Lungs, ClipboardList, Wind, Hourglass, BarChart, Pill, MessageCircle, Thermometer, Droplets, Mountain, Map, PersonStanding } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../contexts/LanguageContext';

interface SmartphoneDataProps {
  data: SmartphoneDataType;
}

type SmartphoneTab = 'activity' | 'sleep' | 'cough' | 'environment' | 'reported';

const TabButton = ({ id, label, icon, activeTab, setActiveTab }: { id: SmartphoneTab; label: string; icon: React.ReactNode; activeTab: SmartphoneTab; setActiveTab: (id: SmartphoneTab) => void; }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-center w-full px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow'
          : 'bg-slate-200/60 text-slate-600 hover:bg-slate-300/80'
      }`}
      aria-pressed={activeTab === id}
    >
      {icon}
      <span className="ml-1.5 hidden sm:inline">{label}</span>
    </button>
  );

const DataCard = ({ label, value, unit, icon, isWarning }: { label: string; value: string | number; unit: string; icon: React.ReactNode; isWarning?: boolean }) => (
    <div className={`p-3 rounded-lg flex items-center gap-3 ${isWarning ? 'bg-yellow-100/70' : 'bg-slate-100/70'}`}>
        <div className={`flex-shrink-0 ${isWarning ? 'text-yellow-600' : 'text-slate-500'}`}>{icon}</div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-base font-bold text-slate-800">
                {value} <span className="text-sm font-normal text-slate-600">{unit}</span>
            </p>
        </div>
    </div>
);


const ActivityTab = ({ data, t }: { data: SmartphoneDataType['activity'], t: (key: string) => string}) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        <DataCard label={t('smartphone.activity.steps')} value={data.steps.toLocaleString()} unit={t('units.steps')} icon={<Footprints className="w-5 h-5" />} isWarning={data.steps < 2000} />
        <DataCard label={t('smartphone.activity.sedentaryTime')} value={data.sedentaryMinutes} unit={t('units.min')} icon={<Hourglass className="w-5 h-5" />} isWarning={data.sedentaryMinutes > 300} />
        <DataCard label={t('smartphone.activity.walkingSpeed')} value={data.movementSpeedKmh.toFixed(1)} unit={t('units.kmh')} icon={<Wind className="w-5 h-5" />} isWarning={data.movementSpeedKmh < 2.5} />
        <DataCard label={t('smartphone.activity.activeTime')} value={data.activeMinutes} unit={t('units.min')} icon={<Footprints className="w-5 h-5" />} />
        <DataCard label={t('smartphone.activity.distance')} value={data.distanceKm.toFixed(1)} unit={t('units.km')} icon={<Map className="w-5 h-5" />} />
        <DataCard label={t('smartphone.activity.floorsClimbed')} value={data.floorsClimbed} unit={t('units.floors')} icon={<Mountain className="w-5 h-5" />} />
    </div>
);

const SleepTab = ({ data, t, language }: { data: SmartphoneDataType['sleep'], t: (key: string, options?: any) => string, language: string}) => {
    const translatePosition = (pos: "supine" | "lateral" | "prone" | "sitting") => {
        return t(`smartphone.sleep.positions.${pos}`);
    };

     // Génère des données historiques simulées pour le graphique
    const sleepHistory = useMemo(() => {
        const history = [];
        const days = [t('days.d6'), t('days.d5'), t('days.d4'), t('days.d3'), t('days.d2'), t('days.d1'), t('days.today')];
        for (let i = 0; i < 6; i++) {
            history.push({
                day: days[i],
                [t('smartphone.sleep.sleepHours')]: data.totalSleepHours + (Math.random() - 0.5) * 2,
                [t('smartphone.sleep.efficiency')]: data.sleepEfficiency + (Math.random() - 0.5) * 10,
                [t('smartphone.sleep.awakeTime')]: data.awakeMinutes + (Math.random() - 0.5) * 20,
            });
        }
        history.push({
            day: days[6],
            [t('smartphone.sleep.sleepHours')]: data.totalSleepHours,
            [t('smartphone.sleep.efficiency')]: data.sleepEfficiency,
            [t('smartphone.sleep.awakeTime')]: data.awakeMinutes,
        });

        // S'assure que les valeurs restent dans une plage réaliste
        return history.map(item => ({
            ...item,
            [t('smartphone.sleep.sleepHours')]: Math.max(3, Math.min(10, parseFloat(item[t('smartphone.sleep.sleepHours')].toFixed(1)))),
            [t('smartphone.sleep.efficiency')]: Math.max(50, Math.min(100, Math.round(item[t('smartphone.sleep.efficiency')]))),
            [t('smartphone.sleep.awakeTime')]: Math.max(10, Math.min(120, Math.round(item[t('smartphone.sleep.awakeTime')]))),
        }));
    }, [data, t, language]);


    return (
        <div className="flex flex-col gap-4 p-1">
            <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sleepHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#8884d8" domain={[0, 12]} unit={t('units.h')} fontSize={12} label={{ value: t('smartphone.sleep.hoursMinutes'), angle: -90, position: 'insideLeft', offset: 10, style: {fontSize: '12px', fill: '#9ca3af'} }}/>
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[50, 100]} unit="%" fontSize={12} />
                        <Tooltip
                             contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem',
                            }}
                        />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line yAxisId="left" type="monotone" dataKey={t('smartphone.sleep.sleepHours')} stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        <Line yAxisId="left" type="monotone" dataKey={t('smartphone.sleep.awakeTime')} stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        <Line yAxisId="right" type="monotone" dataKey={t('smartphone.sleep.efficiency')} stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <DataCard label={t('smartphone.sleep.totalSleep')} value={data.totalSleepHours.toFixed(1)} unit={t('units.h')} icon={<BedDouble className="w-5 h-5" />} isWarning={data.totalSleepHours < 6} />
                <DataCard label={t('smartphone.sleep.sleepEfficiency')} value={data.sleepEfficiency} unit="%" icon={<BarChart className="w-5 h-5" />} isWarning={data.sleepEfficiency < 80} />
                <DataCard label={t('smartphone.sleep.awakeTimeCard')} value={data.awakeMinutes} unit={t('units.min')} icon={<Hourglass className="w-5 h-5" />} isWarning={data.awakeMinutes > 60} />
                <DataCard label={t('smartphone.sleep.nightMovements')} value={data.nightMovements} unit={t('units.times')} icon={<Wind className="w-5 h-5" />} isWarning={data.nightMovements > 30} />
                <DataCard label={t('smartphone.sleep.deepSleep')} value={data.deepSleepMinutes} unit={t('units.min')} icon={<BedDouble className="w-5 h-5" />} />
                <DataCard label={t('smartphone.sleep.sleepPosition')} value={translatePosition(data.sleepPosition)} unit="" icon={<PersonStanding className="w-5 h-5" />} isWarning={data.sleepPosition === 'sitting'} />
            </div>
        </div>
    );
};

const CoughTab = ({ data, t }: { data: SmartphoneDataType['cough'], t: (key: string, options?: any) => string}) => {
    const translatePattern = (pattern: "dry" | "productive" | "wheezing") => {
       return t(`smartphone.cough.patterns.${pattern}`);
    };

    return (
     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        <DataCard label={t('smartphone.cough.frequency')} value={data.coughFrequencyPerHour} unit={t('units.perHour')} icon={<Lungs className="w-5 h-5" />} isWarning={data.coughFrequencyPerHour > 8} />
        <DataCard label={t('smartphone.cough.nightCough')} value={data.nightCoughEpisodes} unit={t('units.episodes')} icon={<BedDouble className="w-5 h-5" />} isWarning={data.nightCoughEpisodes > 5} />
        <DataCard label={t('smartphone.cough.type')} value={translatePattern(data.coughPattern)} unit="" icon={<MessageCircle className="w-5 h-5" />} isWarning={data.coughPattern === 'wheezing'} />
        <DataCard label={t('smartphone.cough.intensity')} value={data.coughIntensityDb} unit="dB" icon={<BarChart className="w-5 h-5" />} />
        <DataCard label={t('smartphone.cough.respiratoryRate')} value={data.respiratoryRate} unit={t('units.rpm')} icon={<Wind className="w-5 h-5" />} isWarning={data.respiratoryRate > 20} />
    </div>
    );
};

const EnvironmentTab = ({ data, t }: { data: SmartphoneDataType['environment'], t: (key: string) => string}) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        <DataCard label={t('smartphone.environment.aqi')} value={data.airQualityIndex} unit="AQI" icon={<Cloudy className="w-5 h-5" />} isWarning={data.airQualityIndex > 100} />
        <DataCard label={t('smartphone.environment.homeTime')} value={data.homeTimePercent} unit="%" icon={<Hourglass className="w-5 h-5" />} isWarning={data.homeTimePercent > 90} />
        <DataCard label={t('smartphone.environment.travelRadius')} value={data.travelRadiusKm.toFixed(1)} unit={t('units.km')} icon={<Map className="w-5 h-5" />} isWarning={data.travelRadiusKm < 1} />
        <DataCard label={t('smartphone.environment.temperature')} value={data.weather.temperatureC} unit="°C" icon={<Thermometer className="w-5 h-5" />} />
        <DataCard label={t('smartphone.environment.humidity')} value={data.weather.humidityPercent} unit="%" icon={<Droplets className="w-5 h-5" />} />
    </div>
);

const ReportedTab = ({ data, t }: { data: SmartphoneDataType['reported'], t: (key: string) => string}) => (
     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
        <DataCard label={t('smartphone.reported.breathlessness')} value={data.symptoms.breathlessness} unit="/10" icon={<Lungs className="w-5 h-5" />} isWarning={data.symptoms.breathlessness > 6} />
        <DataCard label={t('smartphone.reported.fatigue')} value={data.symptoms.fatigue} unit="/10" icon={<Hourglass className="w-5 h-5" />} isWarning={data.symptoms.fatigue > 6} />
        <DataCard label={t('smartphone.reported.catScore')} value={data.qualityOfLife.CAT} unit="/40" icon={<ClipboardList className="w-5 h-5" />} isWarning={data.qualityOfLife.CAT > 20} />
        <DataCard label={t('smartphone.reported.adherence')} value={data.medication.adherencePercent} unit="%" icon={<Pill className="w-5 h-5" />} isWarning={data.medication.adherencePercent < 90} />
        <DataCard label={t('smartphone.reported.missedDoses')} value={data.medication.missedDoses} unit={t('units.doses')} icon={<Pill className="w-5 h-5" />} isWarning={data.medication.missedDoses > 1} />
        <DataCard label={t('smartphone.reported.coughSymptom')} value={data.symptoms.cough} unit="/10" icon={<MessageCircle className="w-5 h-5" />} />
    </div>
);


export function SmartphoneData({ data }: SmartphoneDataProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<SmartphoneTab>('activity');
  const { t, language } = useTranslation();
  
  const renderContent = () => {
      switch(activeTab) {
          case 'activity': return <ActivityTab data={data.activity} t={t} />;
          case 'sleep': return <SleepTab data={data.sleep} t={t} language={language} />;
          case 'cough': return <CoughTab data={data.cough} t={t} />;
          case 'environment': return <EnvironmentTab data={data.environment} t={t} />;
          case 'reported': return <ReportedTab data={data.reported} t={t} />;
          default: return null;
      }
  }

  return (
    <div className="p-1 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 text-center mb-3">{t('smartphone.title')}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
            <TabButton id="activity" label={t('smartphone.tabs.activity')} icon={<Footprints className="w-4 h-4"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="sleep" label={t('smartphone.tabs.sleep')} icon={<BedDouble className="w-4 h-4"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="cough" label={t('smartphone.tabs.cough')} icon={<Lungs className="w-4 h-4"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="environment" label={t('smartphone.tabs.environment')} icon={<Cloudy className="w-4 h-4"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="reported" label={t('smartphone.tabs.reported')} icon={<ClipboardList className="w-4 h-4"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex-grow animate-fade-in">
            {renderContent()}
        </div>
    </div>
  );
}
