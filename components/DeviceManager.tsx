
import React, { useState, useEffect, useMemo } from 'react';
import { Bluetooth, HeartPulse, RefreshCw, Smartphone, Watch, Activity, Battery, Search, CheckCircle, XCircle, AlertTriangle } from './icons';
import { DeviceManager as DeviceManagerService } from '../services/deviceService';
import type { DeviceInfo, DeviceReading, ConnectionStatus, DeviceType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface DeviceManagerProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const deviceManager = DeviceManagerService.getInstance();

const StatCard = ({ title, value, icon, valueColor }: {title: string, value: string | number, icon: React.ReactNode, valueColor?: string}) => (
    <div className="bg-zinc-100/80 p-3 rounded-xl col-span-1">
        <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-medium text-zinc-500">{title}</h3>
            {icon}
        </div>
        <div>
            <p className={`text-xl font-bold ${valueColor || 'text-zinc-800'}`}>{value}</p>
        </div>
    </div>
);

const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button onClick={onClick} className={`px-4 py-2 w-full text-sm font-semibold rounded-lg ${isActive ? 'bg-white shadow text-indigo-600' : 'text-zinc-600 hover:bg-white/80'}`}>
        {children}
    </button>
);

const DeviceIcon = ({ type }: { type: DeviceType }) => {
    const commonClasses = "w-6 h-6";
    if (type === 'wearable') return <Watch className={`${commonClasses} text-green-500`} />;
    if (type === 'smartphone') return <Smartphone className={`${commonClasses} text-blue-500`} />;
    if (type === 'oximeter') return <HeartPulse className={`${commonClasses} text-red-500`} />;
    return <Bluetooth className={`${commonClasses} text-zinc-500`} />;
};

const DeviceCard = ({ device, onConnect, onDisconnect, isConnecting, t }: { device: DeviceInfo, onConnect: (id: string) => void, onDisconnect: (id: string) => void, isConnecting: boolean, t: (key: string) => string }) => (
    <div className={`p-4 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02] ${device.isConnected ? 'bg-green-50 border-green-200 border' : 'bg-zinc-100'}`}>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <DeviceIcon type={device.type} />
                <div>
                    <p className="font-semibold text-zinc-800">{device.name}</p>
                    <p className="text-xs text-zinc-500">{device.model}</p>
                </div>
            </div>
            {device.isConnected ? 
                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1"/> {t('deviceManager.active')}</span> : 
                <span className="flex items-center text-xs font-semibold text-zinc-600 bg-zinc-200 px-2 py-1 rounded-full"><XCircle className="w-3 h-3 mr-1"/> {t('deviceManager.inactive')}</span>
            }
        </div>
        {device.batteryLevel !== undefined && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                <Battery className="w-4 h-4" />
                <div className="w-full bg-zinc-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${device.batteryLevel}%`}}></div>
                </div>
                <span>{device.batteryLevel}%</span>
            </div>
        )}
        <div className="flex">
            {device.isConnected ? (
                 <button onClick={() => onDisconnect(device.id)} disabled={isConnecting} className="w-full px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 disabled:bg-zinc-400 transition-all duration-200">
                    {t('deviceManager.disconnect')}
                </button>
            ) : (
                <button onClick={() => onConnect(device.id)} disabled={isConnecting} className="w-full px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:bg-zinc-400 transition-all duration-200">
                    {isConnecting ? t('deviceManager.connecting') : t('deviceManager.connect')}
                </button>
            )}
        </div>
    </div>
);

const LiveReadingDisplay = ({ reading, t }: { reading: DeviceReading | null, t: (key: string) => string }) => {
    if (!reading) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 bg-zinc-100 rounded-xl">
                <Activity className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-semibold">{t('deviceManager.waitingForData')}</p>
                <p className="text-sm">{t('deviceManager.connectDevicePrompt')}</p>
            </div>
        );
    }
    return (
        <div className="bg-zinc-100 p-4 rounded-xl animate-fade-in">
             <div className="flex justify-between items-baseline mb-4">
                <h4 className="font-semibold text-zinc-700">{t('deviceManager.liveMeasurement')}</h4>
                <p className="text-xs text-zinc-500">{t('deviceManager.quality')}: {reading.quality}%</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {reading.data.spo2 !== undefined && (
                    <div className="text-center p-3 bg-red-100/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{reading.data.spo2}%</div>
                        <div className="text-xs text-zinc-600">SpO₂</div>
                    </div>
                )}
                 {reading.data.heartRate !== undefined && (
                    <div className="text-center p-3 bg-indigo-100/50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{reading.data.heartRate}</div>
                        <div className="text-xs text-zinc-600">{t('deviceManager.heartRateUnit')}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export function DeviceManager({ isConnected, onConnect, onDisconnect }: DeviceManagerProps): React.ReactNode {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('devices');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const [devices, setDevices] = useState<DeviceInfo[]>(deviceManager.getDevices());
  const [liveReading, setLiveReading] = useState<DeviceReading | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(null);
  const stats = useMemo(() => deviceManager.getDeviceStats(), [devices, isConnected]);

  useEffect(() => {
    const unsubConnection = deviceManager.onConnectionStatus(status => {
      setDevices(deviceManager.getDevices());
      const currentConnected = deviceManager.getConnectedDevices()[0] || null;
      setConnectedDevice(currentConnected);
      if(currentConnected) setActiveTab('live');
    });

    const unsubReading = deviceManager.onReading(reading => {
      setLiveReading(reading);
    });

    // Initial setup
    const currentConnected = deviceManager.getConnectedDevices()[0] || null;
    setConnectedDevice(currentConnected);
    if(currentConnected) setActiveTab('live');


    return () => {
      unsubConnection();
      unsubReading();
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const foundDevices = await deviceManager.scanDevices();
      setDevices(foundDevices);
      if (foundDevices.length === 0) {
        setError(t('deviceManager.noDevicesFoundError'));
      }
    } catch (err) {
      setError(t('deviceManager.scanError'));
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleConnect = async (deviceId: string) => {
    setIsConnecting(true);
    setError(null);
    const status = await deviceManager.connectDevice(deviceId);
    if (status.isConnected) {
        onConnect();
    } else {
        setError(t('deviceManager.connectionFailedError', { error: status.error || t('deviceManager.unknownError') }));
    }
    setIsConnecting(false);
  };
  
  const handleDisconnect = async (deviceId: string) => {
    setIsConnecting(true); // Reuse connecting state for loading indicator
    await deviceManager.disconnectDevice(deviceId);
    onDisconnect();
    setIsConnecting(false);
  };

  return (
    <div className="flex flex-col h-full p-1 space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-semibold text-zinc-800">{t('deviceManager.title')}</h3>
        <button onClick={handleScan} disabled={isScanning} className="p-2 rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-wait">
            <RefreshCw className={`w-5 h-5 text-zinc-600 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 px-2">
        <StatCard title={t('deviceManager.total')} value={stats.total} icon={<Bluetooth className="h-4 w-4 text-zinc-400" />} />
        <StatCard title={t('deviceManager.connected')} value={stats.connected} icon={<CheckCircle className="h-4 w-4 text-green-500" />} valueColor="text-green-600" />
        <StatCard title={t('deviceManager.oximeters')} value={stats.byType.oximeter || 0} icon={<HeartPulse className="h-4 w-4 text-red-500" />} valueColor="text-red-600" />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg mx-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
        </div>
      )}

      <div className="p-1 bg-zinc-200/80 rounded-xl flex items-center">
        <TabButton isActive={activeTab === 'devices'} onClick={() => setActiveTab('devices')}>{t('deviceManager.devices')}</TabButton>
        <TabButton isActive={activeTab === 'live'} onClick={() => setActiveTab('live')}>{t('deviceManager.liveData')}</TabButton>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {activeTab === 'devices' && (
          <div className="space-y-3">
            {isScanning ? (
                <div className="text-center py-8 text-zinc-500">
                    <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2">{t('deviceManager.scanning')}</p>
                </div>
            ) : devices.length > 0 ? (
                devices.map(device => (
                    <DeviceCard key={device.id} device={device} onConnect={handleConnect} onDisconnect={handleDisconnect} isConnecting={isConnecting} t={t} />
                ))
            ) : (
                <div className="text-center py-8 text-zinc-500">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold">{t('deviceManager.noDevicesFound')}</p>
                    <p className="text-sm">{t('deviceManager.clickToScan')}</p>
                </div>
            )}
          </div>
        )}
        {activeTab === 'live' && (
            <LiveReadingDisplay reading={liveReading} t={t}/>
        )}
      </div>
    </div>
  );
}
