import type { PatientData, NewPatient, ChatMessage } from '../types';
import type { Language } from '../contexts/LanguageContext';
import { 
    getDoctorDashboardData as getMockDoctorData, 
    addMockPatient as addMockPatientToStore 
} from './mockDataService';
import { getWeatherForPatient } from './weatherService';

// This service now acts as a mock layer since Supabase is disabled.
// It will manage the patient list in-memory.

// Main export function for doctor dashboard
export async function getDoctorDashboardData(lang: Language = 'fr'): Promise<PatientData[]> {
    console.warn("⚠️ Supabase is disabled. Using mock data for doctor dashboard.");
    
    // We still want to enrich mock data with live weather
    const patients = getMockDoctorData();
    
    console.log("🌦️ Fetching live weather data for mock patients...");
    const patientsWithWeather = await Promise.all(
        patients.map(async (patient) => {
            try {
                const weather = await getWeatherForPatient(patient, lang);
                patient.smartphone.environment.weather = {
                    temperatureC: weather.temperature,
                    humidityPercent: weather.humidity
                };
                patient.smartphone.environment.airQualityIndex = weather.airQualityIndex;
                return patient;
            } catch (weatherError) {
                console.warn(`Could not fetch weather for mock patient ${patient.name}.`, weatherError);
                return patient; // Return patient with original data if weather fails
            }
        })
    );
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 200));
    return patientsWithWeather;
}

// Get patient by pairing code
export async function getPatientByCode(pairingCode: string): Promise<PatientData | null> {
    console.warn(`⚠️ Supabase is disabled. Searching mock data for pairing code "${pairingCode}"`);
    const mockPatients = getMockDoctorData();
    const found = mockPatients.find(p => p.code && p.code.toUpperCase() === pairingCode.toUpperCase());
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));
    
    return found || null;
}

// Add new patient
export async function addPatient(newPatient: NewPatient): Promise<PatientData | null> {
    console.warn("⚠️ Supabase is disabled. Adding patient to mock data store.");
    const addedPatient = addMockPatientToStore(newPatient);
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    return addedPatient;
}

// Add measurement
export async function addMeasurement(patient_id: number, spo2: number, heartRate: number) {
    console.warn("⚠️ Supabase is disabled. Measurement not saved.");
    // This is a no-op because we are not persisting measurement changes in mock data.
    // Real-time updates are simulated differently.
    return Promise.resolve();
}

// Get chat history
export async function getChatHistory(patient_id: number, lang: Language): Promise<ChatMessage[]> {
    const now = new Date();
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
    
    console.warn(`⚠️ Supabase is disabled. Using mock chat history for patient ID ${patient_id}`);
    await new Promise(res => setTimeout(res, 300));
    return mockHistories[lang];
}

// Real-time listener
export function listenToPatientChanges(callback: (patients: PatientData[]) => void): () => void {
    console.warn("⚠️ Supabase is disabled. Real-time updates are disabled.");
    // Return a no-op unsubscribe function
    return () => {};
}
