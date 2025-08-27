import { supabase } from './supabaseClient';
import type { PatientData, SmartphoneData, NewPatient, ChatMessage } from '../types';
import type { Language } from '../contexts/LanguageContext';
import { getDoctorDashboardData as getMockDoctorData, getDefaultSmartphoneData } from './mockDataService';
import { getWeatherForPatient } from './weatherService';

// Helper to transform flat smartphone_data from DB to the nested structure the app uses
function transformSmartphoneData(flatData: any): SmartphoneData {
  if (!flatData) return getDefaultSmartphoneData();
  
  return {
    activity: {
      steps: flatData.steps || 0,
      distanceKm: flatData.distance_km || 0,
      activeMinutes: flatData.active_minutes || 0,
      sedentaryMinutes: flatData.sedentary_minutes || 0,
      floorsClimbed: flatData.floors_climbed || 0,
      movementSpeedKmh: flatData.movement_speed_kmh || 0,
    },
    sleep: {
      totalSleepHours: flatData.total_sleep_hours || 0,
      sleepEfficiency: flatData.sleep_efficiency || 0,
      awakeMinutes: flatData.awake_minutes || 0,
      remSleepMinutes: 0, // Not in DB schema, default
      deepSleepMinutes: flatData.deep_sleep_minutes || 0,
      sleepPosition: flatData.sleep_position || 'unknown',
      nightMovements: flatData.night_movements || 0,
    },
    cough: {
      coughFrequencyPerHour: flatData.cough_frequency_per_hour || 0,
      coughIntensityDb: flatData.cough_intensity_db || 0,
      nightCoughEpisodes: flatData.night_cough_episodes || 0,
      coughPattern: flatData.cough_pattern || 'normal',
      respiratoryRate: flatData.respiratory_rate || 0,
    },
    environment: {
      homeTimePercent: flatData.home_time_percent || 0,
      travelRadiusKm: flatData.travel_radius_km || 0,
      airQualityIndex: flatData.air_quality_index || 0,
      weather: {
        temperatureC: flatData.temperature_c || 0,
        humidityPercent: flatData.humidity_percent || 0,
      },
    },
    reported: {
      symptoms: {
        breathlessness: flatData.symptoms_breathlessness || 0,
        cough: flatData.symptoms_cough || 0,
        fatigue: flatData.symptoms_fatigue || 0,
      },
      medication: {
        adherencePercent: flatData.medication_adherence_percent || 0,
        missedDoses: flatData.missed_doses || 0,
      },
      qualityOfLife: {
        CAT: flatData.quality_of_life_cat || 0,
      },
    },
  };
}

// Helper to transform nested smartphone data for DB insertion
function flattenSmartphoneData(nestedData: SmartphoneData): any {
    return {
        steps: nestedData.activity.steps,
        distance_km: nestedData.activity.distanceKm,
        active_minutes: nestedData.activity.activeMinutes,
        sedentary_minutes: nestedData.activity.sedentaryMinutes,
        floors_climbed: nestedData.activity.floorsClimbed,
        movement_speed_kmh: nestedData.activity.movementSpeedKmh,
        total_sleep_hours: nestedData.sleep.totalSleepHours,
        sleep_efficiency: nestedData.sleep.sleepEfficiency,
        awake_minutes: nestedData.sleep.awakeMinutes,
        deep_sleep_minutes: nestedData.sleep.deepSleepMinutes,
        sleep_position: nestedData.sleep.sleepPosition,
        night_movements: nestedData.sleep.nightMovements,
        cough_frequency_per_hour: nestedData.cough.coughFrequencyPerHour,
        cough_intensity_db: nestedData.cough.coughIntensityDb,
        night_cough_episodes: nestedData.cough.nightCoughEpisodes,
        cough_pattern: nestedData.cough.coughPattern,
        respiratory_rate: nestedData.cough.respiratoryRate,
        home_time_percent: nestedData.environment.homeTimePercent,
        travel_radius_km: nestedData.environment.travelRadiusKm,
        air_quality_index: nestedData.environment.airQualityIndex,
        temperature_c: nestedData.environment.weather.temperatureC,
        humidity_percent: nestedData.environment.weather.humidityPercent,
        symptoms_breathlessness: nestedData.reported.symptoms.breathlessness,
        symptoms_cough: nestedData.reported.symptoms.cough,
        symptoms_fatigue: nestedData.reported.symptoms.fatigue,
        medication_adherence_percent: nestedData.reported.medication.adherencePercent,
        missed_doses: nestedData.reported.medication.missedDoses,
        quality_of_life_cat: nestedData.reported.qualityOfLife.CAT,
    };
}

// Robust function to fetch patients with relationships
async function fetchAndTransformAllPatients(lang: Language): Promise<PatientData[]> {
    if (!supabase) {
        throw new Error("Supabase client not initialized");
    }

    try {
        console.log("🔄 Attempting to fetch patients and related data...");
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        // Step 1: Fetch patients with smartphone data
        const { data: patientsData, error: patientsError } = await supabase
            .from('patients')
            .select(`
                *,
                smartphone_data ( * )
            `);

        if (patientsError) throw patientsError;
        if (!patientsData || patientsData.length === 0) {
            console.log("ℹ️ No patients found");
            return [];
        }
        
        // Step 2: Fetch all relevant data from the last 7 days
        const { data: measurementsData, error: measurementsError } = await supabase.from('measurements').select('*').gte('timestamp', sevenDaysAgoISO);
        if (measurementsError) throw measurementsError;
        
        const { data: medicationsData, error: medicationsError } = await supabase.from('medications').select('*');
        if (medicationsError) throw medicationsError;

        const { data: logsData, error: logsError } = await supabase.from('medication_logs').select('*').gte('taken_at', sevenDaysAgoISO);
        if (logsError) throw logsError;
        
        // Step 3: Map related data by patient_id for efficient lookup
        const measurementsMap = new Map<number, any[]>();
        measurementsData?.forEach(m => {
             if (!measurementsMap.has(m.patient_id)) measurementsMap.set(m.patient_id, []);
             measurementsMap.get(m.patient_id)?.push(m);
        });
        
        const medicationsMap = new Map<number, any[]>();
        medicationsData?.forEach(med => {
            if (!medicationsMap.has(med.patient_id)) medicationsMap.set(med.patient_id, []);
            medicationsMap.get(med.patient_id)?.push(med);
        });

        const logsMap = new Map<number, any[]>();
        logsData?.forEach(log => {
            if (!logsMap.has(log.patient_id)) logsMap.set(log.patient_id, []);
            logsMap.get(log.patient_id)?.push(log);
        });
        
        // Step 4: Combine the data before transformation
        const combinedPatients = patientsData.map(p => ({
            ...p,
            measurements: (measurementsMap.get(p.id) || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            medications: medicationsMap.get(p.id) || [],
            medication_logs: logsMap.get(p.id) || [],
        }));
        
        const transformedPatients = combinedPatients.map((p: any) => transformPatientData(p));

        console.log("🌦️ Fetching live weather data for all patients...");
        const patientsWithWeather = await Promise.all(
            transformedPatients.map(async (patient) => {
                try {
                    const weather = await getWeatherForPatient(patient, lang);
                    patient.smartphone.environment.weather = {
                        temperatureC: weather.temperature,
                        humidityPercent: weather.humidity
                    };
                    patient.smartphone.environment.airQualityIndex = weather.airQualityIndex;
                    return patient;
                } catch (weatherError) {
                    console.warn(`Could not fetch weather for ${patient.name}. Using DB data.`, weatherError);
                    return patient;
                }
            })
        );
        
        console.log("✅ Successfully fetched and combined patient data for the last 7 days");
        return patientsWithWeather;

    } catch (err: any) {
        console.error("❌ Error in fetchAndTransformAllPatients:", err.message || err, err);
        throw err;
    }
}


// Helper function to transform patient data consistently
function transformPatientData(p: any): PatientData {
    const flatSmartphoneData = Array.isArray(p.smartphone_data) ? p.smartphone_data[0] : p.smartphone_data;
    
    // Transform measurements to match the app's data model (heart_rate -> heartRate) and sort them
    const transformedMeasurements = p.measurements 
        ? p.measurements.map((m: { timestamp: string; spo2: number; heart_rate: number; }) => ({
            timestamp: m.timestamp,
            spo2: m.spo2,
            heartRate: m.heart_rate 
          })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        : [];
    
    // Remove original DB-style fields that have been transformed to avoid confusion
    const { measurements, smartphone_data, ...restOfPatient } = p;

    return {
        ...restOfPatient,
        measurements: transformedMeasurements,
        smartphone: transformSmartphoneData(flatSmartphoneData),
        medications: p.medications || [],
        medication_logs: p.medication_logs || [],
    };
}

// Main export function for doctor dashboard
export async function getDoctorDashboardData(lang: Language = 'fr'): Promise<PatientData[]> {
    if (!supabase) {
        console.warn("⚠️ Supabase is not configured. Falling back to mock data for doctor dashboard.");
        return getMockDoctorData();
    }

    try {
        return await fetchAndTransformAllPatients(lang);
    } catch (err: any) {
        console.error("❌ Failed to fetch real data, falling back to mock data:", err.message || err, err);
        return getMockDoctorData();
    }
}

// Get patient by pairing code
export async function getPatientByCode(pairingCode: string): Promise<PatientData | null> {
    if (!supabase) {
        console.error("❌ Supabase client not initialized.");
        const mockPatients = getMockDoctorData();
        const found = mockPatients.find(p => p.id === 1);
        if (found) {
            console.warn(`⚠️ Supabase not configured. Returning mock patient for pairing code "${pairingCode}"`);
            return { ...found, code: pairingCode.toUpperCase() };
        }
        return null;
    }

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        // Step 1: Fetch patient with smartphone data
        const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select(`
                *,
                smartphone_data ( * )
            `)
            .eq('code', pairingCode.toUpperCase())
            .maybeSingle();
        
        if (patientError) throw patientError;

        if (!patientData) {
            console.log(`ℹ️ Pairing code ${pairingCode} not found.`);
            return null;
        }

        // Step 2: Fetch related data for this specific patient for the last 7 days
        const patientId = patientData.id;
        const { data: measurementsData, error: measurementsError } = await supabase
            .from('measurements')
            .select('*')
            .eq('patient_id', patientId)
            .gte('timestamp', sevenDaysAgoISO);
        if (measurementsError) throw measurementsError;

        const { data: medicationsData, error: medicationsError } = await supabase
            .from('medications')
            .select('*')
            .eq('patient_id', patientId);
        if (medicationsError) throw medicationsError;

        const { data: logsData, error: logsError } = await supabase
            .from('medication_logs')
            .select('*')
            .eq('patient_id', patientId)
            .gte('taken_at', sevenDaysAgoISO);
        if (logsError) throw logsError;
        
        // Step 3: Combine and transform
        const combinedPatient = {
            ...patientData,
            measurements: measurementsData || [],
            medications: medicationsData || [],
            medication_logs: logsData || [],
        };

        console.log(`✅ Found patient for code ${pairingCode}`);
        return transformPatientData(combinedPatient);

    } catch (err: any) {
        console.error('❌ Exception in getPatientByCode:', err.message || err, err);
        return null;
    }
}

// Generate unique pairing code
async function generateCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let code = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    if (!supabase) {
        throw new Error("Supabase client not initialized.");
    }

    while (!isUnique && attempts < maxAttempts) {
        code = `${Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')}-${Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')}`;
        
        const { data, error } = await supabase
            .from('patients')
            .select('id')
            .eq('code', code)
            .maybeSingle();

        if (error) {
            console.error('❌ Error checking code uniqueness:', error);
            attempts++;
            continue;
        }

        if (!data) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique code after maximum attempts');
    }

    return code;
}

// Add measurement
export async function addMeasurement(patient_id: number, spo2: number, heartRate: number) {
    if (!supabase) {
        console.error("❌ Supabase client not initialized. Measurement not sent.");
        return;
    }

    try {
        const { error } = await supabase
            .from('measurements')
            .insert([{ patient_id, spo2, heart_rate: heartRate }]);

        if (error) {
            console.error('❌ Error adding measurement:', error);
            throw error;
        }

        console.log(`✅ Added measurement for patient ${patient_id}`);
    } catch (err: any) {
        console.error('❌ Exception in addMeasurement:', err.message || err, err);
        throw err;
    }
}

// Add new patient
export async function addPatient(newPatient: NewPatient): Promise<PatientData | null> {
    if (!supabase) {
        console.error("❌ Supabase client not initialized. Cannot add patient.");
        return null;
    }
    
    try {
        const code = await generateCode();

        const patientToInsert = {
            name: newPatient.name,
            age: newPatient.age,
            condition: newPatient.condition,
            city: newPatient.city,
            country: newPatient.country,
            code: code
        };

        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .insert(patientToInsert)
            .select()
            .single();

        if (patientError) throw patientError;

        const defaultSmartphoneData = getDefaultSmartphoneData();
        const flatSmartphoneData = {
            ...flattenSmartphoneData(defaultSmartphoneData),
            patient_id: patient.id
        };

        const { error: smartphoneError } = await supabase
            .from('smartphone_data')
            .insert(flatSmartphoneData);

        if (smartphoneError) {
            await supabase.from('patients').delete().eq('id', patient.id);
            throw smartphoneError;
        }

        console.log(`✅ Successfully created patient with code ${code}`);

        return {
            ...patient,
            measurements: [],
            smartphone: defaultSmartphoneData,
            medications: [],
            medication_logs: []
        };

    } catch (err: any) {
        console.error('❌ Exception in addPatient:', err.message || err, err);
        throw err;
    }
}

// Get chat history
export async function getChatHistory(patient_id: number, lang: Language): Promise<ChatMessage[]> {
    const now = new Date();
    // FIX: Explicitly type the mock history object to match ChatMessage[] and resolve role type error.
    const mockHistories: { [key in Language]: ChatMessage[] } = {
      fr: [
        { role: 'model', text: 'Bonjour ! Comment vous sentez-vous aujourd\'hui ?', timestamp: new Date(now.getTime() - 5 * 60000) },
        { role: 'user', text: 'Je suis un peu plus essoufflé que d\'habitude.', timestamp: new Date(now.getTime() - 4 * 60000) },
        { role: 'model', text: 'Merci de me le faire savoir. Avez-vous pris votre traitement ce matin ?', timestamp: new Date(now.getTime() - 3 * 60000) },
      ],
      en: [
        { role: 'model', text: 'Hello! How are you feeling today?', timestamp: new Date(now.getTime() - 5 * 60000) },
        { role: 'user', text: 'I feel a bit more breathless than usual.', timestamp: new Date(now.getTime() - 4 * 60000) },
        { role: 'model', text: 'Thank you for letting me know. Did you take your medication this morning?', timestamp: new Date(now.getTime() - 3 * 60000) },
      ],
      ar: [
        { role: 'model', text: 'مرحباً! كيف تشعر اليوم؟', timestamp: new Date(now.getTime() - 5 * 60000) },
        { role: 'user', text: 'أشعر بضيق في التنفس أكثر من المعتاد.', timestamp: new Date(now.getTime() - 4 * 60000) },
        { role: 'model', text: 'شكراً لإخباري. هل تناولت أدويتك هذا الصباح؟', timestamp: new Date(now.getTime() - 3 * 60000) },
      ]
    };

    if (supabase) {
        try {
            const { data: chatHistory, error } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('patient_id', patient_id)
                .order('created_at', { ascending: true });
                
            if (!error && chatHistory && chatHistory.length > 0) {
                return chatHistory.map(msg => ({
                    role: msg.role as 'user' | 'model',
                    text: msg.content,
                    timestamp: new Date(msg.created_at),
                }));
            }
        } catch (err: any) {
            console.warn(`⚠️ Chat messages table not available. Using mock data for patient ${patient_id}`, err.message || err);
        }
    }

    console.warn(`⚠️ Using mock chat history for patient ID ${patient_id}`);
    return mockHistories[lang];
}

// Real-time listener
export function listenToPatientChanges(callback: (patients: PatientData[]) => void): () => void {
    if (!supabase) {
        console.warn("⚠️ Supabase not configured. Real-time updates disabled.");
        return () => {};
    }

    try {
        const channel = supabase
            .channel('realtime-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public' },
                async (payload) => {
                    console.log('📡 Real-time change received:', payload.table);
                    try {
                        // Assuming a default language for background updates
                        const updatedPatients = await fetchAndTransformAllPatients('fr');
                        callback(updatedPatients);
                    } catch (err: any) {
                        console.error('❌ Error handling real-time update:', err.message || err, err);
                    }
                }
            )
            .subscribe();
        
        console.log("📡 Real-time listener subscribed");
        
        return () => {
            console.log("📡 Real-time listener unsubscribed");
            supabase.removeChannel(channel);
        };
    } catch (err: any) {
        console.error("❌ Failed to set up real-time listener:", err.message || err, err);
        return () => {};
    }
}