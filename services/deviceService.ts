
import type { DeviceInfo, DeviceCapability, DeviceReading, DeviceType, ConnectionStatus } from '../types';

/**
 * Sentinelle Device Manager
 * Gestion des dispositifs médicaux (oxymètre, capteurs smartphone)
 * Version simulée pour démonstration
 */
export class DeviceManager {
  private static instance: DeviceManager;
  private devices: Map<string, DeviceInfo> = new Map();
  private connectionCallbacks: Set<(status: ConnectionStatus) => void> = new Set();
  private readingCallbacks: Set<(reading: DeviceReading) => void> = new Set();
  private dataCollectionInterval: number | null = null;

  private constructor() {
    this.initializeMockDevices();
  }

  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    return DeviceManager.instance;
  }

  private initializeMockDevices() {
    const mockDevices: DeviceInfo[] = [
      {
        id: 'oximeter-001',
        name: 'Contec CMS50D+',
        type: 'oximeter',
        model: 'CMS50D+',
        manufacturer: 'Contec',
        batteryLevel: 85,
        isConnected: false,
        lastSeen: new Date().toISOString(),
        capabilities: [
          { name: 'SpO2', type: 'spo2', unit: '%', range: [70, 100], precision: 1 },
          { name: 'Heart Rate', type: 'heartRate', unit: 'bpm', range: [30, 250], precision: 1 },
          { name: 'Perfusion Index', type: 'perfusion', unit: '%', range: [0.1, 20], precision: 0.1 }
        ]
      },
      {
        id: 'wearable-001',
        name: 'HealthSense Watch',
        type: 'wearable',
        model: 'Series 8',
        manufacturer: 'HealthCo',
        batteryLevel: 72,
        isConnected: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        capabilities: [
          { name: 'Heart Rate', type: 'heartRate', unit: 'bpm', range: [30, 220], precision: 1 },
          { name: 'SpO2', type: 'spo2', unit: '%', range: [70, 100], precision: 1 },
          { name: 'Sleep', type: 'sleep', unit: 'hours', range: [0, 24], precision: 0.1 },
          { name: 'Activity', type: 'activity', unit: 'steps', range: [0, 100000], precision: 1 }
        ]
      }
    ];

    mockDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  async scanDevices(): Promise<DeviceInfo[]> {
    // Simulate Bluetooth scan
    return new Promise((resolve) => {
      setTimeout(() => {
        const availableDevices = Array.from(this.devices.values());
        resolve(availableDevices);
      }, 2000); // 2 second scan time
    });
  }

  async connectDevice(deviceId: string): Promise<ConnectionStatus> {
    const device = this.devices.get(deviceId);
    
    if (!device) {
      const status: ConnectionStatus = { isConnected: false, error: 'Device not found', lastUpdate: new Date().toISOString() };
      this.notifyConnectionStatus(status);
      return status;
    }

    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      device.isConnected = true;
      device.lastSeen = new Date().toISOString();
      
      const status: ConnectionStatus = { isConnected: true, device: { ...device }, lastUpdate: new Date().toISOString() };
      this.notifyConnectionStatus(status);
      
      if (device.type === 'oximeter' || device.type === 'wearable') {
        this.startDataCollection(deviceId);
      }
      
      return status;
    } catch (error) {
      const status: ConnectionStatus = { isConnected: false, device: { ...device }, error: error instanceof Error ? error.message : 'Connection failed', lastUpdate: new Date().toISOString() };
      this.notifyConnectionStatus(status);
      return status;
    }
  }

  async disconnectDevice(deviceId: string): Promise<ConnectionStatus> {
    const device = this.devices.get(deviceId);
    
    if (this.dataCollectionInterval) {
        clearInterval(this.dataCollectionInterval);
        this.dataCollectionInterval = null;
    }

    if (!device) {
      const status: ConnectionStatus = { isConnected: false, error: 'Device not found', lastUpdate: new Date().toISOString() };
      this.notifyConnectionStatus(status);
      return status;
    }

    device.isConnected = false;
    device.lastSeen = new Date().toISOString();
    
    const status: ConnectionStatus = { isConnected: false, device: { ...device }, lastUpdate: new Date().toISOString() };
    this.notifyConnectionStatus(status);
    return status;
  }

  private startDataCollection(deviceId: string) {
    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval);
    }

    const collectData = () => {
      const device = this.devices.get(deviceId);
      if (!device || !device.isConnected) {
        if(this.dataCollectionInterval) clearInterval(this.dataCollectionInterval);
        return;
      }
      const reading = this.generateMockReading(deviceId);
      this.notifyReading(reading);
    };

    this.dataCollectionInterval = setInterval(collectData, 5000) as unknown as number;
  }

  private generateMockReading(deviceId: string): DeviceReading {
    const device = this.devices.get(deviceId)!;
    const reading: DeviceReading = {
      deviceId,
      timestamp: new Date().toISOString(),
      data: {},
      quality: Math.floor(Math.random() * 20) + 80, // 80-100
      isValid: true
    };

    const hasSpo2 = device.capabilities.some(c => c.type === 'spo2');
    const hasHeartRate = device.capabilities.some(c => c.type === 'heartRate');

    if (hasSpo2) {
       reading.data.spo2 = Math.max(88, Math.min(99, 94 + (Math.random() - 0.55) * 4)); // Tendency to drop
    }
     if (hasHeartRate) {
       reading.data.heartRate = Math.max(60, Math.min(110, 85 + (Math.random() - 0.45) * 10)); // Tendency to rise
    }

    return reading;
  }
  
  async takeManualReading(deviceId: string): Promise<DeviceReading> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isConnected) {
      throw new Error('Device not connected');
    }

    const reading = this.generateMockReading(deviceId);
    reading.quality = Math.floor(Math.random() * 10) + 90; // 90-100
    
    this.notifyReading(reading);
    return reading;
  }

  getDevices(): DeviceInfo[] {
    return Array.from(this.devices.values());
  }

  getConnectedDevices(): DeviceInfo[] {
    return Array.from(this.devices.values()).filter(d => d.isConnected)
  }

  getDeviceStats(): {
    total: number;
    connected: number;
    byType: Record<string, number>;
    averageBattery: number;
  } {
    const devices = Array.from(this.devices.values());
    const connectedDevices = devices.filter(d => d.isConnected);
    
    const byType = devices.reduce((acc, device) => {
      acc[device.type] = (acc[device.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const batteryDevices = devices.filter(d => d.batteryLevel !== undefined);
    const totalBattery = batteryDevices.reduce((sum, d) => sum + (d.batteryLevel || 0), 0);
    const averageBattery = batteryDevices.length > 0 ? totalBattery / batteryDevices.length : 0;

    return {
      total: devices.length,
      connected: connectedDevices.length,
      byType,
      averageBattery: Math.round(averageBattery)
    };
  }

  onConnectionStatus(callback: (status: ConnectionStatus) => void): () => void {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  onReading(callback: (reading: DeviceReading) => void): () => void {
    this.readingCallbacks.add(callback);
    return () => this.readingCallbacks.delete(callback);
  }

  private notifyConnectionStatus(status: ConnectionStatus) {
    this.connectionCallbacks.forEach(callback => callback(status));
  }

  private notifyReading(reading: DeviceReading) {
    this.readingCallbacks.forEach(callback => callback(reading));
  }
}