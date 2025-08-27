
import type { ActivityType, MobilityUpdateData } from '../types';

// Singleton class to manage and simulate mobility data
export class MobilityService {
  private static instance: MobilityService;
  
  private hasPermission = false;
  private isTracking = false;
  private batteryLevel = 80 + Math.random() * 20;
  private collectionInterval = 5000;
  private trackingIntervalId: number | null = null;
  
  private currentState: MobilityUpdateData = {
    activityType: 'stationary',
    mobilityScore: 0,
    stepFrequency: 0,
    movementSpeed: 0,
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { alpha: 0, beta: 0, gamma: 0 },
    batteryLevel: this.batteryLevel,
    collectionInterval: this.collectionInterval,
    isTracking: this.isTracking,
    hasPermission: this.hasPermission,
  };

  private callbacks: Set<(data: MobilityUpdateData) => void> = new Set();

  private constructor() {}

  public static getInstance(): MobilityService {
    if (!MobilityService.instance) {
      MobilityService.instance = new MobilityService();
    }
    return MobilityService.instance;
  }

  public onUpdate(callback: (data: MobilityUpdateData) => void): () => void {
    this.callbacks.add(callback);
    // Immediately send the current state to the new subscriber
    callback(this.currentState);
    return () => this.callbacks.delete(callback);
  }

  private notifyUpdates() {
    this.callbacks.forEach(cb => cb(this.currentState));
  }

  public async requestPermission(): Promise<boolean> {
    // Simulate user granting permission after a short delay
    return new Promise(resolve => {
        setTimeout(() => {
            this.hasPermission = true;
            this.currentState.hasPermission = true;
            this.notifyUpdates();
            resolve(true);
        }, 1000);
    });
  }

  public startTracking() {
    if (this.isTracking || !this.hasPermission) return;

    this.isTracking = true;
    this.currentState.isTracking = true;
    this.trackingIntervalId = setInterval(() => this.simulateData(), this.collectionInterval) as unknown as number;
    this.notifyUpdates();
  }

  public stopTracking() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    this.currentState.isTracking = false;
    if (this.trackingIntervalId) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }
    // Reset to stationary when tracking stops
    this.currentState.activityType = 'stationary';
    this.currentState.mobilityScore = 0;
    this.notifyUpdates();
  }
  
  private simulateData() {
    // 1. Simulate battery drain
    this.batteryLevel = Math.max(0, this.batteryLevel - 0.1);
    this.currentState.batteryLevel = this.batteryLevel;

    // 2. Adapt collection interval based on battery
    this.adaptCollectionFrequency();
    this.currentState.collectionInterval = this.collectionInterval;

    // 3. Simulate sensor data and activity
    const randomFactor = Math.random();
    let activity: ActivityType = 'stationary';
    let magnitude = 0;

    if (randomFactor > 0.85) {
        activity = 'running';
        magnitude = 3 + Math.random() * 3;
    } else if (randomFactor > 0.4) {
        activity = 'walking';
        magnitude = 1 + Math.random() * 2;
    } else {
        activity = 'stationary';
        magnitude = Math.random();
    }
    this.currentState.activityType = activity;

    // Simulate accelerometer based on activity
    this.currentState.accelerometer = {
        x: (Math.random() - 0.5) * magnitude,
        y: (Math.random() - 0.5) * magnitude,
        z: 9.8 + (Math.random() - 0.5) * magnitude
    };

    // Simulate gyroscope
    this.currentState.gyroscope = {
        alpha: Math.random() * 360,
        beta: (Math.random() - 0.5) * 180,
        gamma: (Math.random() - 0.5) * 90
    };
    
    // 4. Calculate derived metrics
    this.calculateMobilityScore();
    this.currentState.stepFrequency = activity === 'walking' ? 1.5 + Math.random() : activity === 'running' ? 2.5 + Math.random() : 0;
    this.currentState.movementSpeed = activity === 'walking' ? 3 + Math.random() * 2 : activity === 'running' ? 8 + Math.random() * 4 : 0;


    this.notifyUpdates();
  }
  
  private adaptCollectionFrequency() {
      let newInterval = 5000; // Default 5s
      if (this.batteryLevel < 20) {
          newInterval = 300000; // 5 minutes
      } else if (this.batteryLevel < 50) {
          newInterval = 120000; // 2 minutes
      }
      
      if (newInterval !== this.collectionInterval) {
          this.collectionInterval = newInterval;
          // Restart interval with new frequency
          if(this.currentState.isTracking) {
             if (this.trackingIntervalId) clearInterval(this.trackingIntervalId);
             this.trackingIntervalId = setInterval(() => this.simulateData(), this.collectionInterval) as unknown as number;
          }
      }
  }
  
  private calculateMobilityScore() {
    let score = 0;
    switch(this.currentState.activityType) {
        case 'running': score = 80 + Math.random() * 20; break;
        case 'walking': score = 40 + Math.random() * 30; break;
        case 'stationary': score = 10 + Math.random() * 10; break;
        default: score = 0;
    }
    this.currentState.mobilityScore = Math.round(score);
  }
}
