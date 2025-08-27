import type { PatientData, WeatherData } from '../types';
import type { Language } from '../contexts/LanguageContext';

const API_KEY = '898fd0b8f91cf20c956e9cfd91c8899b';

// --- Caching Mechanism ---
interface CacheEntry {
    data: WeatherData;
    timestamp: number;
}
// Use a Map to store weather data by location (e.g., "paris,fr")
const weatherCache = new Map<string, CacheEntry>();
// Cache validity duration in milliseconds (1 hour)
const CACHE_DURATION_MS = 60 * 60 * 1000; 

// Helper to capitalize first letter of each word
const capitalize = (str: string): string => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Fetches real weather data for a given patient's location using OpenWeatherMap API.
 * This function now includes a cache to limit API calls.
 */
export async function getWeatherForPatient(patient: PatientData, lang: Language): Promise<WeatherData> {
    if (!patient.city || !patient.country) {
        throw new Error("Patient city and country are required to get weather data.");
    }
    
    // Create a unique cache key for the location and language
    const cacheKey = `${patient.city},${patient.country},${lang}`.toLowerCase();
    const cachedEntry = weatherCache.get(cacheKey);

    // If a valid entry exists in the cache, return it immediately
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS)) {
        console.log(`🌦️ CACHE HIT: Using cached weather data for ${cacheKey}`);
        return cachedEntry.data;
    }

    console.log(`🌦️ CACHE MISS: Fetching new weather data for ${cacheKey}`);

    if (!API_KEY) {
        console.error("OpenWeatherMap API key is not configured. Set the OPENWEATHERMAP_API_KEY environment variable.");
        // Fallback to a mock response if API key is missing to avoid crashing the app.
        const fallbackData = {
            location: `${patient.city}, ${patient.country}`,
            condition: 'Weather Service Unavailable',
            temperature: 0,
            humidity: 0,
            windSpeed: 0,
            airQualityIndex: 0,
            pollenLevel: 'Low' as const,
            uvIndex: 0,
        };
        weatherCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
        return fallbackData;
    }

    // --- 1. Geocoding: Get coordinates for the city ---
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(patient.city)},${encodeURIComponent(patient.country)}&limit=1&appid=${API_KEY}`;
    let lat: number, lon: number;

    try {
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error(`Geocoding error: ${geoResponse.statusText}`);
        }
        const geoData = await geoResponse.json();
        if (!geoData || geoData.length === 0) {
            throw new Error(`City not found: ${patient.city}`);
        }
        lat = geoData[0].lat;
        lon = geoData[0].lon;
    } catch (error) {
        console.error("Failed to geocode patient location:", error);
        throw error;
    }

    // --- 2. Fetch Weather and Air Quality in parallel ---
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const [weatherResponse, airQualityResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(airQualityUrl)
        ]);

        if (!weatherResponse.ok || !airQualityResponse.ok) {
            // Check for specific error for better debugging
            if (!weatherResponse.ok) console.error("Weather API failed:", await weatherResponse.text());
            if (!airQualityResponse.ok) console.error("Air Quality API failed:", await airQualityResponse.text());
            throw new Error('One of the weather API calls failed.');
        }

        const weatherData = await weatherResponse.json();
        const airQualityData = await airQualityResponse.json();

        // --- 3. Transform data to match application's WeatherData type ---
        
        // Convert OpenWeatherMap AQI (1-5) to a more common scale (e.g., ~0-500)
        // 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
        const aqiValue = airQualityData.list?.[0]?.main.aqi || 0;
        const mappedAqi = [0, 25, 75, 125, 175, 250][aqiValue] || 0;
        
        // Simulate Pollen and UV data as they are not available in the free tier
        const pollenLevels: ('Low' | 'Medium' | 'High' | 'Very High')[] = ['Low', 'Medium', 'High', 'Very High'];
        const simulatedPollen = pollenLevels[Math.floor(Math.random() * pollenLevels.length)];
        const simulatedUvIndex = Math.floor(Math.random() * 8); // Simulate a UV index from 0 to 7

        const transformedData: WeatherData = {
            location: `${patient.city}, ${patient.country}`,
            condition: capitalize(weatherData.weather?.[0]?.description || 'N/A'),
            temperature: Math.round(weatherData.main?.temp || 0),
            humidity: weatherData.main?.humidity || 0,
            windSpeed: Math.round((weatherData.wind?.speed || 0) * 3.6), // m/s to km/h
            airQualityIndex: mappedAqi,
            pollenLevel: simulatedPollen,
            uvIndex: simulatedUvIndex,
        };
        
        // Store new data in the cache before returning it
        weatherCache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
        
        return transformedData;

    } catch (error) {
        console.error("Failed to fetch weather data from OpenWeatherMap:", error);
        throw new Error("Could not retrieve real-time weather data.");
    }
}