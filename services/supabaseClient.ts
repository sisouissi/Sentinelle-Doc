import { createClient, SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these values with the URL and Anon Key from your Supabase project.
// You can find them in the API settings of your Supabase project.
const supabaseUrl: string = "https://kjwncksyayqmevulcpef.supabase.co"; // Example: "https://abcedfghijklmnopqrst.supabase.co"
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd25ja3N5YXlxbWV2dWxjcGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIxNjUsImV4cCI6MjA3MTczODE2NX0.ewHJJdWWv-pKTpVHqQmq-KD2rTZ1z_gnQipdYDX0hgA"; // Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX..."

let supabaseInstance: SupabaseClient | null = null;

// Check if the default values have been changed.
const isConfigured = supabaseUrl !== "VOTRE_URL_SUPABASE" && supabaseAnonKey !== "VOTRE_CLE_ANON_SUPABASE";

if (isConfigured) {
    try {
        // Validate that the URL has a correct format before initializing the client.
        // This prevents a crash if the copied URL is malformed.
        new URL(supabaseUrl);
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("The Supabase URL provided in `services/supabaseClient.ts` is not valid:", supabaseUrl);
        // supabaseInstance remains null, which will trigger an error in the UI.
    }
} else {
    // If not configured, display a clear message in the console for the developer.
    console.error("Please configure your Supabase URL and key in the `services/supabaseClient.ts` file.");
}

// Export the instance, which will be `null` if the configuration is missing or invalid.
// The rest of the application is designed to handle this case and display an error to the user.
export const supabase = supabaseInstance;