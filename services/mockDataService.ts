import type { PatientData, Measurement, RiskLevel, AlertData, SmartphoneData, MedicationLog, NewPatient, SpeechData, SmokingCessationLog } from '../types';
import type { TFunction } from '../contexts/LanguageContext';

function createMeasurements(baseSpo2: number, baseHeartRate: number, trend: 'stable' | 'down' | 'up'): Measurement[] {
  const measurements: Measurement[] = [];
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 4);

  let currentSpo2 = baseSpo2;
  let currentHeartRate = baseHeartRate;

  for (let i = 0; i < 60; i++) { // Generate 60 points over 4 hours
    measurements.push({
      timestamp: new Date(currentDate.getTime() + i * 4 * 60 * 1000),
      spo2: parseFloat(currentSpo2.toFixed(0)),
      heartRate: parseFloat(currentHeartRate.toFixed(0)),
    });

    const spo2Change = (Math.random() - 0.5) * 1; 
    const hrChange = (Math.random() - 0.5) * 2; 

    if (trend === 'down') {
      currentSpo2 -= (0.05 + Math.random() * 0.1);
      currentHeartRate += (0.1 + Math.random() * 0.15);
    } else if (trend === 'up') {
      currentSpo2 += (0.05 + Math.random() * 0.08);
      currentHeartRate -= (0.1 + Math.random() * 0.15);
    }

    currentSpo2 += spo2Change;
    currentHeartRate += hrChange;
    
    currentSpo2 = Math.max(88, Math.min(99, currentSpo2));
    currentHeartRate = Math.max(55, Math.min(115, currentHeartRate));
  }
  return measurements;
}

const highRiskSpeechData: SpeechData = {
    speechRateWPM: 95,
    pauseFrequencyPerMin: 8,
    articulationScore: 78,
    lastAnalysisTimestamp: new Date().toISOString()
};

const stableSpeechData: SpeechData = {
    speechRateWPM: 130,
    pauseFrequencyPerMin: 3,
    articulationScore: 92,
    lastAnalysisTimestamp: new Date().toISOString()
};

const recoveringSpeechData: SpeechData = {
    speechRateWPM: 145,
    pauseFrequencyPerMin: 2,
    articulationScore: 96,
    lastAnalysisTimestamp: new Date().toISOString()
};


const highRiskSmartphoneData: SmartphoneData = {
    activity: { steps: 1200, distanceKm: 0.8, activeMinutes: 15, sedentaryMinutes: 450, floorsClimbed: 1, movementSpeedKmh: 1.8 },
    sleep: { totalSleepHours: 4.8, sleepEfficiency: 65, awakeMinutes: 90, remSleepMinutes: 40, deepSleepMinutes: 30, sleepPosition: "sitting", nightMovements: 45 },
    cough: { coughFrequencyPerHour: 12, coughIntensityDb: 75, nightCoughEpisodes: 8, coughPattern: "wheezing", respiratoryRate: 24 },
    environment: { homeTimePercent: 95, travelRadiusKm: 0.5, airQualityIndex: 110, weather: { temperatureC: 3, humidityPercent: 85 } },
    reported: { symptoms: { breathlessness: 8, cough: 7, fatigue: 9 }, medication: { adherencePercent: 75, missedDoses: 2 }, qualityOfLife: { CAT: 32 }, smoking: { cigarettesSmokedToday: 5, cravingsToday: 8, daysSmokeFree: 0 } },
    speech: highRiskSpeechData
};

const stableSmartphoneData: SmartphoneData = {
    activity: { steps: 2800, distanceKm: 2.1, activeMinutes: 40, sedentaryMinutes: 280, floorsClimbed: 4, movementSpeedKmh: 2.5 },
    sleep: { totalSleepHours: 6.1, sleepEfficiency: 82, awakeMinutes: 40, remSleepMinutes: 70, deepSleepMinutes: 60, sleepPosition: "lateral", nightMovements: 20 },
    cough: { coughFrequencyPerHour: 3, coughIntensityDb: 60, nightCoughEpisodes: 2, coughPattern: "dry", respiratoryRate: 18 },
    environment: { homeTimePercent: 70, travelRadiusKm: 1.1, airQualityIndex: 45, weather: { temperatureC: 18, humidityPercent: 60 } },
    reported: { symptoms: { breathlessness: 4, cough: 3, fatigue: 4 }, medication: { adherencePercent: 95, missedDoses: 0 }, qualityOfLife: { CAT: 18 }, smoking: { cigarettesSmokedToday: 0, cravingsToday: 2, daysSmokeFree: 12 } },
    speech: stableSpeechData
};

const recoveringSmartphoneData: SmartphoneData = {
    activity: { steps: 4500, distanceKm: 3.5, activeMinutes: 65, sedentaryMinutes: 180, floorsClimbed: 8, movementSpeedKmh: 3.5 },
    sleep: { totalSleepHours: 7.5, sleepEfficiency: 90, awakeMinutes: 25, remSleepMinutes: 90, deepSleepMinutes: 80, sleepPosition: "lateral", nightMovements: 12 },
    cough: { coughFrequencyPerHour: 1, coughIntensityDb: 55, nightCoughEpisodes: 0, coughPattern: "dry", respiratoryRate: 16 },
    environment: { homeTimePercent: 50, travelRadiusKm: 2.0, airQualityIndex: 30, weather: { temperatureC: 22, humidityPercent: 55 } },
    reported: { symptoms: { breathlessness: 2, cough: 1, fatigue: 2 }, medication: { adherencePercent: 100, missedDoses: 0 }, qualityOfLife: { CAT: 12 }, smoking: { cigarettesSmokedToday: 0, cravingsToday: 0, daysSmokeFree: 380 } },
    speech: recoveringSpeechData
};

export function getDefaultSmartphoneData(): SmartphoneData {
  return {
    activity: { steps: 0, distanceKm: 0, activeMinutes: 0, sedentaryMinutes: 0, floorsClimbed: 0, movementSpeedKmh: 0 },
    sleep: { totalSleepHours: 0, sleepEfficiency: 0, awakeMinutes: 0, remSleepMinutes: 0, deepSleepMinutes: 0, sleepPosition: "lateral", nightMovements: 0 },
    cough: { coughFrequencyPerHour: 0, coughIntensityDb: 0, nightCoughEpisodes: 0, coughPattern: "dry", respiratoryRate: 16 },
    environment: { homeTimePercent: 0, travelRadiusKm: 0, airQualityIndex: 50, weather: { temperatureC: 20, humidityPercent: 50 } },
    reported: { symptoms: { breathlessness: 0, cough: 0, fatigue: 0 }, medication: { adherencePercent: 100, missedDoses: 0 }, qualityOfLife: { CAT: 0 }, smoking: { cigarettesSmokedToday: 0, cravingsToday: 0, daysSmokeFree: 0 } },
    speech: { speechRateWPM: 0, pauseFrequencyPerMin: 0, articulationScore: 0, lastAnalysisTimestamp: new Date().toISOString() },
  };
}


const allPatientsRaw: Omit<PatientData, 'medication_logs' | 'smoking_cessation_logs'>[] = [
    {
        id: 1,
        name: 'Jean Dupont',
        age: 67,
        condition: 'BPCO Sévère',
        city: 'Paris',
        country: 'FR',
        measurements: createMeasurements(91, 95, 'down'),
        smartphone: highRiskSmartphoneData,
        emergency_contact_name: 'Anne Dupont',
        emergency_contact_phone: '06 12 34 56 78',
        medications: [
            { id: 1, patient_id: 1, is_active: true, name: 'Spiriva Respimat', dosage: '2 bouffées', schedules: [{ id: 1, medication_id: 1, time_of_day: 'Matin (09:00)' }] },
            { id: 2, patient_id: 1, is_active: true, name: 'Symbicort', dosage: '2 bouffées', schedules: [{ id: 2, medication_id: 2, time_of_day: 'Matin (09:00)' }, { id: 3, medication_id: 2, time_of_day: 'Soir (21:00)' }] },
            { id: 3, patient_id: 1, is_active: true, name: 'Ventoline (si besoin)', dosage: '1-2 bouffées', schedules: [{ id: 4, medication_id: 3, time_of_day: 'Au besoin' }] },
        ],
        code: 'ABC-123',
    },
    {
        id: 2,
        name: 'Marie Lambert',
        age: 72,
        condition: 'BPCO, ICC',
        city: 'Lyon',
        country: 'FR',
        measurements: createMeasurements(94, 82, 'stable'),
        smartphone: stableSmartphoneData,
        emergency_contact_name: 'Luc Lambert',
        emergency_contact_phone: '06 87 65 43 21',
        medications: [
            { id: 4, patient_id: 2, is_active: true, name: 'Furosemide', dosage: '40mg', schedules: [{ id: 5, medication_id: 4, time_of_day: 'Matin (08:00)' }] },
            { id: 5, patient_id: 2, is_active: true, name: 'Enalapril', dosage: '10mg', schedules: [{ id: 6, medication_id: 5, time_of_day: 'Matin (08:00)' }] },
        ],
        code: 'DEF-456',
    },
    {
        id: 3,
        name: 'Pierre Martin',
        age: 65,
        condition: 'Post-Exacerbation',
        city: 'Marseille',
        country: 'FR',
        measurements: createMeasurements(97, 75, 'up'),
        smartphone: recoveringSmartphoneData,
        medications: [
             { id: 6, patient_id: 3, is_active: true, name: 'Prednisone', dosage: '20mg (dégressif)', schedules: [{ id: 7, medication_id: 6, time_of_day: 'Matin' }] },
             { id: 7, patient_id: 3, is_active: true, name: 'Amoxicilline', dosage: '1g', schedules: [{ id: 8, medication_id: 7, time_of_day: 'Matin' }, { id: 9, medication_id: 7, time_of_day: 'Soir' }] },
        ],
        code: 'GHI-789',
    },
    {
        id: 4,
        name: 'Sophie Bernard',
        age: 70,
        condition: 'Chevauchement Asthme-BPCO',
        city: 'Lille',
        country: 'FR',
        measurements: createMeasurements(93, 88, 'down'),
        smartphone: { ...stableSmartphoneData, speech: stableSpeechData, activity: { ...stableSmartphoneData.activity, steps: 2100 }, environment: {...stableSmartphoneData.environment, airQualityIndex: 90} },
        emergency_contact_name: 'Hélène Bernard',
        emergency_contact_phone: '07 00 11 22 33',
        medications: [],
        code: 'JKL-101',
    },
    {
        id: 5,
        name: 'Robert Dubois',
        age: 68,
        condition: 'BPCO Stable',
        city: 'Bordeaux',
        country: 'FR',
        measurements: createMeasurements(98, 72, 'stable'),
        smartphone: { ...recoveringSmartphoneData, speech: recoveringSpeechData, activity: { ...recoveringSmartphoneData.activity, steps: 6200 } },
        medications: [],
        code: 'MNO-212',
    }
];

function generateMockLogs(patient: Omit<PatientData, 'medication_logs' | 'smoking_cessation_logs'>): MedicationLog[] {
    const logs: MedicationLog[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) { // Generate logs for the past 7 days
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        patient.medications.forEach(med => {
            if (!med.is_active) return;
            med.schedules.forEach(schedule => {
                if (schedule.time_of_day.includes('Au besoin')) return;

                // Simple check to decide if a dose is logged
                let wasTaken = true;
                if (patient.id === 1 && med.name === 'Symbicort') { // Jean Dupont misses Symbicort sometimes
                    wasTaken = Math.random() > 0.3; // 30% chance of missing
                } else if (patient.id === 2) { // Marie Lambert misses rarely
                    wasTaken = Math.random() > 0.1; // 10% chance of missing
                }

                if (wasTaken) {
                    // Extract time like "09:00" from "Matin (09:00)"
                    const timeMatch = schedule.time_of_day.match(/(\d{2}:\d{2})/);
                    const hour = timeMatch ? parseInt(timeMatch[1].split(':')[0]) : 9;
                    const minute = timeMatch ? parseInt(timeMatch[1].split(':')[1]) : 0;
                    
                    const takenDate = new Date(date);
                    takenDate.setHours(hour, minute, 0, 0);

                    logs.push({
                        id: logs.length + 1,
                        schedule_id: schedule.id,
                        patient_id: patient.id,
                        taken_at: takenDate.toISOString(),
                    });
                }
            });
        });
    }
    return logs;
}

function generateMockSmokingLogs(patientId: number): SmokingCessationLog[] {
    const logs: SmokingCessationLog[] = [];
    const now = new Date();
    const triggers = ['Stress', 'Café', 'Après le repas', 'Social'];

    if (patientId === 1) { // Jean Dupont, active smoker
        for (let i = 0; i < 7; i++) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);
            const dailySmoked = 3 + Math.floor(Math.random() * 5); // 3-7 cigarettes
            for (let j = 0; j < dailySmoked; j++) {
                 logs.push({
                    id: logs.length + 1,
                    patient_id: patientId,
                    timestamp: new Date(day.getTime() - j * 2 * 3600 * 1000).toISOString(),
                    type: 'smoked',
                    trigger: triggers[Math.floor(Math.random() * triggers.length)]
                });
            }
        }
    } else if (patientId === 2) { // Marie Lambert, trying to quit
        for (let i = 0; i < 14; i++) { // Logs over 14 days
             const day = new Date(now);
             day.setDate(now.getDate() - i);
             if (i > 11) { // Smoked before 12 days ago
                logs.push({ id: logs.length + 1, patient_id: patientId, timestamp: day.toISOString(), type: 'smoked' });
             } else { // Cravings and resisted since then
                if (Math.random() > 0.6) {
                    logs.push({ id: logs.length + 1, patient_id: patientId, timestamp: day.toISOString(), type: 'craving', trigger: 'Stress' });
                    logs.push({ id: logs.length + 1, patient_id: patientId, timestamp: new Date(day.getTime() + 600000).toISOString(), type: 'resisted' });
                }
             }
        }
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}



let allPatients: PatientData[] = allPatientsRaw.map(p => ({
    ...p,
    medication_logs: generateMockLogs(p),
    smoking_cessation_logs: generateMockSmokingLogs(p.id)
}));

export function addMockPatient(newPatient: NewPatient): PatientData {
    const nextId = allPatients.length > 0 ? Math.max(...allPatients.map(p => p.id)) + 1 : 1;
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    const code = `${Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')}-${Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')}`;

    const addedPatient: PatientData = {
        id: nextId,
        ...newPatient,
        measurements: [],
        smartphone: getDefaultSmartphoneData(),
        medications: [],
        medication_logs: [],
        smoking_cessation_logs: [],
        code: code,
    };

    allPatients.push(addedPatient);
    return addedPatient;
}

export function getInitialData(): PatientData {
  return allPatients[0];
}

export function getDoctorDashboardData(): PatientData[] {
    return allPatients;
}

export function calculateRiskScore(data: PatientData): { score: number; level: RiskLevel } {
  const { measurements, smartphone } = data;
  const { activity, sleep, cough, environment, reported } = smartphone;
  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  let criticalScore = 0;
  let importantScore = 0;
  let secondaryScore = 0;

  // --- I. Critical Parameters (Total Weight: 40 points) ---

  // 1. Activity Decline (30% of 40 = 12 points)
  if (activity.steps < 1500) criticalScore += 12;
  else if (activity.steps < 2500) criticalScore += 6;

  // 2. Sleep Disturbance (25% of 40 = 10 points)
  if (sleep.totalSleepHours < 5) criticalScore += 5;
  if (sleep.sleepEfficiency < 70) criticalScore += 5;

  // 3. Cough Increase (25% of 40 = 10 points)
  if (cough.coughFrequencyPerHour > 10) criticalScore += 6;
  if (cough.nightCoughEpisodes > 5) criticalScore += 4;
  
  // 4. Breathlessness Reported (20% of 40 = 8 points)
  if (reported.symptoms.breathlessness >= 8) criticalScore += 8;
  else if (reported.symptoms.breathlessness >= 6) criticalScore += 4;

  // --- II. Important Parameters (Total Weight: 35 points) ---
  if (latest) {
    // 1. Heart Rate Elevation (Weight: 6 points)
    if (latest.heartRate > 100) importantScore += 6;
    else if (latest.heartRate > 90) importantScore += 3;

    // 2. Oxygen Desaturation (Weight: 8 points)
    if (latest.spo2 < 90) importantScore += 8;
    else if (latest.spo2 < 92) importantScore += 5;
    else if (latest.spo2 < 94) importantScore += 2.5;
  }

  // 3. Environmental Triggers (AQI) (Weight: 5 points)
  if (environment.airQualityIndex > 100) importantScore += 5;
  else if (environment.airQualityIndex > 75) importantScore += 2.5;
  
  // 4. NEW: Weather Impact (Weight: 7 points)
  if (environment.weather.temperatureC < 5 || environment.weather.temperatureC > 30) {
    importantScore += 3.5;
  }
  if (environment.weather.humidityPercent > 80) {
    importantScore += 3.5;
  }

  // 5. Medication Adherence (Weight: 4 points)
  // Use dynamic adherence calculation
  const adherence = calculateMedicationAdherence(data);
  if (adherence < 80) importantScore += 4;
  else if (adherence < 90) importantScore += 2;

  // 6. Social Withdrawal (Home Time) (Weight: 5 points)
  if (environment.homeTimePercent > 95) importantScore += 5;
  else if (environment.homeTimePercent > 85) importantScore += 2.5;


  // --- III. Secondary Parameters (Total Weight: 25 points) ---
  
  // 1. GPS Mobility (Weight: 15 points)
  if (environment.travelRadiusKm < 1.0) {
    secondaryScore += 15;
  } else if (environment.travelRadiusKm < 2.0) {
    secondaryScore += 7;
  }

  // 2. Sleep Position (Weight: 10 points)
  if (sleep.sleepPosition === 'sitting') {
    secondaryScore += 10;
  } else if (sleep.sleepPosition === 'supine') {
    secondaryScore += 3; // Less critical but can still be a factor
  }


  const totalScore = Math.min(100, Math.round(criticalScore + importantScore + secondaryScore));

  let level: RiskLevel;
  if (totalScore >= 61) {
    level = 'High';
  } else if (totalScore >= 31) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return { score: totalScore, level };
}


export function getMockAlerts(patients: PatientData[], t: TFunction): AlertData[] {
    const allAlerts: AlertData[] = [];
    const createdAlerts = new Set<string>(); // To track created alerts: 'patientId-type'

    patients.forEach(patient => {
        // --- Alert on risk score ---
        const { score, level } = calculateRiskScore(patient);
        if (level === 'High') {
            const alertKey = `${patient.id}-high_risk`;
            if (!createdAlerts.has(alertKey)) {
                const { measurements } = patient;
                const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
                const spo2Message = latestMeasurement ? t('alerts.spo2Detail', { spo2: latestMeasurement.spo2 }) : '';
                allAlerts.push({
                    id: alertKey,
                    patientId: patient.id,
                    patientName: patient.name,
                    type: 'high_risk',
                    severity: 'high',
                    message: `${t('alerts.highRiskScore', { score })}${spo2Message}`,
                    timestamp: new Date(),
                });
                createdAlerts.add(alertKey);
            }
        }
        
        // --- Specific scenario alerts for variety ---
        if (patient.id === 4) { // Sophie Bernard for declining trend
             const alertKey = `${patient.id}-declining_trend`;
             if (!createdAlerts.has(alertKey)) {
                  allAlerts.push({
                    id: alertKey,
                    patientId: patient.id,
                    patientName: patient.name,
                    type: 'declining_trend',
                    severity: 'medium',
                    message: t('alerts.decliningTrend'),
                    timestamp: new Date(new Date().getTime() - 2 * 60 * 60 * 1000),
                });
                createdAlerts.add(alertKey);
             }
        }
        
        if (level === 'Medium' && patient.id !== 4) { // A medium risk patient for a missed measurement
             const alertKey = `${patient.id}-missed_measurement`;
             if (!createdAlerts.has(alertKey)) {
                allAlerts.push({
                    id: alertKey,
                    patientId: patient.id,
                    patientName: patient.name,
                    type: 'missed_measurement',
                    severity: 'low',
                    message: t('alerts.missedMeasurement'),
                    timestamp: new Date(new Date().getTime() - 4 * 60 * 60 * 1000),
                });
                createdAlerts.add(alertKey);
             }
        }
    });

    // Sort alerts by severity then by time
    const severityOrder = { high: 1, medium: 2, low: 3 };
    allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.timestamp.getTime() - a.timestamp.getTime());
    
    return allAlerts;
}

export function calculateMedicationAdherence(patient: PatientData): number {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);

    let totalExpected = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        patient.medications.forEach(med => {
            if (!med.is_active) return;
            med.schedules.forEach(schedule => {
                // Ignore "as needed" and future doses
                if (schedule.time_of_day.includes('Au besoin')) return;
                
                const timeMatch = schedule.time_of_day.match(/(\d{2}:\d{2})/);
                const hour = timeMatch ? parseInt(timeMatch[1].split(':')[0]) : 9;
                const minute = timeMatch ? parseInt(timeMatch[1].split(':')[1]) : 0;
                
                const scheduledTime = new Date(date);
                scheduledTime.setHours(hour, minute, 0, 0);

                if (scheduledTime < today) {
                    totalExpected++;
                }
            });
        });
    }

    if (totalExpected === 0) return 100;

    const takenDoses = patient.medication_logs.filter(log => {
        const takenDate = new Date(log.taken_at);
        return takenDate >= sevenDaysAgo && takenDate <= today;
    });

    return Math.round((takenDoses.length / totalExpected) * 100);
}