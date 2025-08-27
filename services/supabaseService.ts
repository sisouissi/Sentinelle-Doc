import { supabase } from './supabaseClient';
import type { PatientData, SmartphoneData, NewPatient, ChatMessage } from '../types';
import { getDoctorDashboardData as getMockDoctorData, getDefaultSmartphoneData } from './mockDataService';

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

// Test function to diagnose Supabase connection and query issues
export async function testSupabaseQueries() {
    if (!supabase) {
        console.error("❌ Supabase not initialized");
        return;
    }

    console.log("🧪 Starting Supabase diagnostic tests...");

    try {
        // Test 1: Basic connection and patients table
        console.log("🧪 Test 1: Basic patients query");
        const { data: patients, error: patientsError } = await supabase
            .from('patients')
            .select('*')
            .limit(3);
        console.log("✅ Patients:", patients, "Error:", patientsError);

        if (patientsError) {
            console.error("❌ Patients table query failed:", patientsError);
            return;
        }

        // Test 2: Measurements table
        console.log("🧪 Test 2: Measurements table");
        const { data: measurements, error: measurementsError } = await supabase
            .from('measurements')
            .select('*')
            .limit(3);
        console.log("✅ Measurements:", measurements, "Error:", measurementsError);

        // Test 3: Smartphone data table
        console.log("🧪 Test 3: Smartphone data table");
        const { data: smartphoneData, error: smartphoneError } = await supabase
            .from('smartphone_data')
            .select('*')
            .limit(3);
        console.log("✅ Smartphone data:", smartphoneData, "Error:", smartphoneError);

        // Test 4: Simple relation test
        if (patients && patients.length > 0) {
            console.log("🧪 Test 4: Simple relation test");
            const { data: withMeasurements, error: relationError } = await supabase
                .from('patients')
                .select(`
                    id, name,
                    measurements ( timestamp, spo2, heart_rate )
                `)
                .eq('id', patients[0].id);
            console.log("✅ With measurements:", withMeasurements, "Error:", relationError);
        }

    } catch (err) {
        console.error("❌ Test error:", err);
    }
}

// Robust function to fetch patients with relationships
async function fetchAndTransformAllPatients(): Promise<PatientData[]> {
    if (!supabase) {
        throw new Error("Supabase client not initialized");
    }

    try {
        console.log("Attempting to fetch patients with relationships...");
        
        const { data: patients, error } = await supabase
            .from('patients')
            .select(`
                *,
                measurements ( timestamp, spo2, heart_rate ),
                smartphone_data ( * )
            `)
            .order('timestamp', { foreignTable: 'measurements', ascending: false })
            .limit(20, { foreignTable: 'measurements' });

        if (error) {
            console.warn("Relationship query failed, trying sequential approach:", error);
            return await fetchPatientsSequentially();
        }

        if (!patients || patients.length === 0) {
            console.log("No patients found");
            return [];
        }

        console.log("Successfully fetched patients with relationships");
        return patients.map((p: any) => ({
            ...p,
            measurements: p.measurements ? p.measurements.reverse() : [],
            smartphone: transformSmartphoneData(Array.isArray(p.smartphone_data) ? p.smartphone_data[0] : p.smartphone_data),
            medications: [],
            medication_logs: [],
        }));

    } catch (err) {
        console.error("Error in fetchAndTransformAllPatients:", err);
        console.log("Falling back to sequential fetch...");
        return await fetchPatientsSequentially();
    }
}

// Sequential approach if relationship queries fail
async function fetchPatientsSequentially(): Promise<PatientData[]> {
    if (!supabase) return [];

    try {
        // 1. Get all patients first
        const { data: patients, error: patientsError } = await supabase
            .from('patients')
            .select('*');

        if (patientsError) {
            console.error("❌ Failed to fetch patients:", patientsError);
            throw patientsError;
        }

        if (!patients || patients.length === 0) {
            return [];
        }

        console.log(`📊 Fetching detailed data for ${patients.length} patients...`);

        // 2. Fetch related data for each patient
        const enrichedPatients = await Promise.all(
            patients.map(async (patient) => {
                try {
                    const [measurementsResult, smartphoneResult, medicationsResult, logsResult] = await Promise.all([
                        // Measurements
                        supabase
                            .from('measurements')
                            .select('timestamp, spo2, heart_rate')
                            .eq('patient_id', patient.id)
                            .order('timestamp', { ascending: false })
                            .limit(20),
                        
                        // Smartphone data
                        supabase
                            .from('smartphone_data')
                            .select('*')
                            .eq('patient_id', patient.id)
                            .maybeSingle(), // Use maybeSingle() instead of single() to avoid errors if no data
                        
                        // Medications
                        supabase
                            .from('medications')
                            .select('*')
                            .eq('patient_id', patient.id),
                        
                        // Medication logs
                        supabase
                            .from('medication_logs')
                            .select('*')
                            .eq('patient_id', patient.id)
                    ]);

                    return {
                        ...patient,
                        measurements: measurementsResult.data?.reverse() || [],
                        smartphone: transformSmartphoneData(smartphoneResult.data),
                        medications: medicationsResult.data || [],
                        medication_logs: logsResult.data || [],
                    };
                } catch (err) {
                    console.error(`❌ Error fetching data for patient ${patient.id}:`, err);
                    // Return patient with default data if there's an error
                    return {
                        ...patient,
                        measurements: [],
                        smartphone: getDefaultSmartphoneData(),
                        medications: [],
                        medication_logs: [],
                    };
                }
            })
        );

        console.log("✅ Successfully enriched all patients");
        return enrichedPatients;

    } catch (err) {
        console.error("❌ Sequential fetch failed:", err);
        throw err;
    }
}

// Helper function to transform patient data consistently
function transformPatientData(p: any): PatientData {
    const flatSmartphoneData = Array.isArray(p.smartphone_data) ? p.smartphone_data[0] : p.smartphone_data;
    
    return {
        ...p,
        measurements: p.measurements ? p.measurements.reverse() : [],
        smartphone: transformSmartphoneData(flatSmartphoneData),
        medications: p.medications || [],
        medication_logs: p.medication_logs || [],
    };
}

// Main export function for doctor dashboard
export async function getDoctorDashboardData(): Promise<PatientData[]> {
    if (!supabase) {
        console.warn("⚠️ Supabase is not configured. Falling back to mock data for doctor dashboard.");
        return getMockDoctorData();
    }

    try {
        return await fetchAndTransformAllPatients();
    } catch (err) {
        console.error("❌ Failed to fetch real data, falling back to mock data:", err);
        return getMockDoctorData();
    }
}

// Get patient by pairing code
export async function getPatientByCode(pairingCode: string): Promise<PatientData | null> {
    if (!supabase) {
        console.error("❌ Supabase client not initialized.");
        // Fallback for local dev
        const mockPatients = getMockDoctorData();
        const found = mockPatients.find(p => p.id === 1);
        if (found) {
            console.warn(`⚠️ Supabase not configured. Returning mock patient for pairing code "${pairingCode}"`);
            return { ...found, code: pairingCode.toUpperCase() };
        }
        return null;
    }

    try {
        const { data: patient, error } = await supabase
            .from('patients')
            .select(`
                *,
                measurements ( timestamp, spo2, heart_rate ),
                smartphone_data ( * ),
                medications ( * ),
                medication_logs ( * )
            `)
            .eq('code', pairingCode.toUpperCase())
            .order('timestamp', { foreignTable: 'measurements', ascending: false })
            .limit(60, { foreignTable: 'measurements' })
            .maybeSingle(); // Use maybeSingle() to avoid errors if no data found
        
        if (error) {
            console.error('❌ Error fetching patient by pairing code:', error);
            return null;
        }

        if (!patient) {
            console.log(`ℹ️ Pairing code ${pairingCode} not found.`);
            return null;
        }

        console.log(`✅ Found patient for code ${pairingCode}`);
        return transformPatientData(patient);

    } catch (err) {
        console.error('❌ Exception in getPatientByCode:', err);
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
export async function addMeasurement(patient_id: number, spo2: number, heart_rate: number) {
    if (!supabase) {
        console.error("❌ Supabase client not initialized. Measurement not sent.");
        return;
    }

    try {
        const { error } = await supabase
            .from('measurements')
            .insert([{ patient_id, spo2, heart_rate }]);

        if (error) {
            console.error('❌ Error adding measurement:', error);
            throw error;
        }

        console.log(`✅ Added measurement for patient ${patient_id}`);
    } catch (err) {
        console.error('❌ Exception in addMeasurement:', err);
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

        // 1. Create the patient first
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

        if (patientError) {
            console.error('❌ Error creating patient:', patientError);
            throw patientError;
        }

        // 2. Create default smartphone data
        const defaultSmartphoneData = getDefaultSmartphoneData();
        const flatSmartphoneData = {
            ...flattenSmartphoneData(defaultSmartphoneData),
            patient_id: patient.id
        };

        const { error: smartphoneError } = await supabase
            .from('smartphone_data')
            .insert(flatSmartphoneData);

        if (smartphoneError) {
            console.error('❌ Error creating smartphone data:', smartphoneError);
            // Clean up orphaned patient record
            await supabase.from('patients').delete().eq('id', patient.id);
            throw smartphoneError;
        }

        console.log(`✅ Successfully created patient with code ${code}`);

        // 3. Return the newly created patient
        return {
            ...patient,
            measurements: [],
            smartphone: defaultSmartphoneData,
            medications: [],
            medication_logs: []
        };

    } catch (err) {
        console.error('❌ Exception in addPatient:', err);
        throw err;
    }
}

// Get chat history (mock implementation)
export async function getChatHistory(patient_id: number): Promise<ChatMessage[]> {
    const now = new Date();
    const mockHistory: ChatMessage[] = [
        { role: 'model', text: 'Bonjour ! Comment vous sentez-vous aujourd\'hui ?', timestamp: new Date(now.getTime() - 5 * 60000) },
        { role: 'user', text: 'Je suis un peu plus essoufflé que d\'habitude.', timestamp: new Date(now.getTime() - 4 * 60000) },
        { role: 'model', text: 'Merci de me le faire savoir. Avez-vous pris votre traitement ce matin ?', timestamp: new Date(now.getTime() - 3 * 60000) },
        { role: 'user', text: 'Oui, comme d\'habitude', timestamp: new Date(now.getTime() - 2 * 60000) },
        { role: 'model', text: 'D\'accord. Essayez de vous reposer un peu. Si l\'essoufflement s\'aggrave, n\'hésitez pas à suivre votre plan d\'action ou à contacter votre médecin.', timestamp: new Date(now.getTime() - 1 * 60000) }
    ];

    if (supabase) {
        try {
            // Try to fetch from Supabase if chat_messages table exists
            const { data: chatHistory, error } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('patient_id', patient_id)
                .order('created_at', { ascending: true });
                
            if (!error && chatHistory) {
                return chatHistory.map(msg => ({
                    role: msg.role as 'user' | 'model',
                    text: msg.content,
                    timestamp: new Date(msg.created_at),
                }));
            }
        } catch (err) {
            console.warn(`⚠️ Chat messages table not available. Using mock data for patient ${patient_id}`);
        }
    }

    console.warn(`⚠️ Using mock chat history for patient ID ${patient_id}`);
    return mockHistory;
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
                        const updatedPatients = await fetchAndTransformAllPatients();
                        callback(updatedPatients);
                    } catch (err) {
                        console.error('❌ Error handling real-time update:', err);
                    }
                }
            )
            .subscribe();
        
        console.log("📡 Real-time listener subscribed");
        
        return () => {
            console.log("📡 Real-time listener unsubscribed");
            supabase.removeChannel(channel);
        };
    } catch (err) {
        console.error("❌ Failed to set up real-time listener:", err);
        return () => {};
    }
}
