
import React from 'react';
import { ArrowDown, ArrowUp } from './icons';

interface VitalsCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export function VitalsCard({ title, value, trend, icon }: VitalsCardProps): React.ReactNode {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm col-span-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        {icon}
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {trend !== 'stable' && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </div>
        )}
      </div>
    </div>
  );
}
