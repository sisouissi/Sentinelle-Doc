import type { CompletePrediction, FactorAnalysis, AnomalyAlert, PatientData, RiskLevel, HeatmapDataPoint } from '../types';
import type { Language, TFunction } from '../contexts/LanguageContext';
import { getDoctorDashboardData, calculateRiskScore } from './mockDataService';
import { analyzePatientDataForPrediction } from './geminiService';

class PredictionService {
    private static instance: PredictionService;
    private intervalId: number | null = null;
    private callbacks: Set<(data: CompletePrediction) => void> = new Set();
    private allPatients: PatientData[] = getDoctorDashboardData();
    private currentPatient: PatientData | null = null;
    private lastPrediction: CompletePrediction | null = null;
    private currentLang: Language = 'fr';
    private currentT: TFunction = () => '';

    private constructor() {}

    public static getInstance(): PredictionService {
        if (!PredictionService.instance) {
            PredictionService.instance = new PredictionService();
        }
        return PredictionService.instance;
    }

    public startStreaming(patientId: number, lang: Language, t: TFunction) {
        this.stopStreaming();
        this.currentPatient = this.allPatients.find(p => p.id === patientId) || null;
        this.currentLang = lang;
        this.currentT = t;

        if (!this.currentPatient) {
            console.error(`Patient with ID ${patientId} not found.`);
            return;
        }

        const runPrediction = async () => {
            try {
                await this.generatePrediction();
            } catch (error) {
                console.error("Error during prediction generation:", error);
            }
        };

        runPrediction(); // Initial prediction
        this.intervalId = setInterval(runPrediction, 10000) as unknown as number;
    }

    public stopStreaming() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.lastPrediction = null;
        this.currentPatient = null;
    }

    public onUpdate(callback: (data: CompletePrediction) => void): () => void {
        this.callbacks.add(callback);
        if (this.lastPrediction) {
            callback(this.lastPrediction);
        }
        return () => this.callbacks.delete(callback);
    }

    private notifyUpdates() {
        if (this.lastPrediction) {
            this.callbacks.forEach(cb => cb(this.lastPrediction!));
        }
    }

    private async generatePrediction() {
        if (!this.currentPatient) return;
        
        const { score, level } = calculateRiskScore(this.currentPatient);

        // Simulate fluctuation for display
        const riskScore = Math.min(100, Math.max(0, score + (Math.random() - 0.5) * 5));
        const confidence = 85 + (Math.random() - 0.5) * 10;
        
        // --- Use Gemini for analysis ---
        const { contributingFactors, recommendations } = await analyzePatientDataForPrediction(this.currentPatient, score, level, this.currentLang);

        // --- Keep mock data for other visual elements ---
        const alerts = this.generateAlerts(level);
        const activityData = this.generateActivityData();
        
        let levels: ['high' | 'medium' | 'low', 'high' | 'medium' | 'low', 'high' | 'medium' | 'low'];
        if (level === 'High') {
            levels = ['medium', 'low', 'low']; // Worsening trend
        } else if (level === 'Medium') {
            levels = ['high', 'medium', 'low']; // Sharp decline
        } else {
            levels = ['medium', 'high', 'high']; // Improving/Stable high
        }

        const heatmapData: HeatmapDataPoint[] = [
            { dayLabel: this.currentT('days.d2'), data: this.generateHeatmapData(8, 12, levels[0]) },
            { dayLabel: this.currentT('days.d1'), data: this.generateHeatmapData(8, 12, levels[1]) },
            { dayLabel: this.currentT('days.today'), data: this.generateHeatmapData(8, 12, levels[2]) },
        ].reverse();


        this.lastPrediction = {
            patientId: this.currentPatient.id,
            riskScore: Math.round(riskScore),
            confidence: Math.round(confidence),
            timeHorizon: 24 + Math.round(Math.random() * 48),
            contributingFactors,
            alerts,
            recommendations,
            lastUpdate: new Date().toISOString(),
            activityData,
            heatmapData,
        };
        
        this.notifyUpdates();
    }
    
    private generateAlerts(level: RiskLevel): AnomalyAlert[] {
        if (level === 'High' && Math.random() > 0.5) {
            return [{
                id: `alert-${Date.now()}`,
                type: 'vital_sign_anomaly',
                severity: 'high',
                description: `SpO₂ drop detected. Current: ${this.currentPatient?.measurements.slice(-1)[0].spo2}%`,
                timestamp: new Date(),
                confidence: 95
            }];
        }
        if(level === 'Medium' && Math.random() > 0.7) {
             return [{
                id: `alert-${Date.now()}`,
                type: 'mobility_decline',
                severity: 'medium',
                description: `Significant drop in daily steps detected.`,
                timestamp: new Date(),
                confidence: 88
            }];
        }
        return [];
    }
    
    private generateActivityData(): { time: string; steps: number; activeMinutes: number }[] {
        const data = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hour = time.getHours();
            let steps = 0;
            let activeMinutes = 0;
            if (hour > 7 && hour < 21) { // More active during the day
                steps = Math.random() * 500;
                activeMinutes = Math.random() * 10;
            } else {
                 steps = Math.random() * 50;
                 activeMinutes = Math.random() * 2;
            }
             data.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                steps: Math.round(steps),
                activeMinutes: Math.round(activeMinutes)
            });
        }
        return data;
    }
    
    private generateHeatmapData(rows = 8, cols = 12, activityLevel: 'high' | 'medium' | 'low' = 'medium'): number[][] {
        const data = Array.from({ length: rows }, () => Array(cols).fill(0));
        let activityPoints = 0;
        if (activityLevel === 'high') {
            activityPoints = 15 + Math.floor(Math.random() * 10);
        } else if (activityLevel === 'medium') {
            activityPoints = 8 + Math.floor(Math.random() * 7);
        } else { // low
            activityPoints = 3 + Math.floor(Math.random() * 5);
        }
        
        for(let i=0; i<activityPoints; i++) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            data[r][c] = Math.random(); // Intensity
        }
        return data;
    }
}

export const predictionService = PredictionService.getInstance();