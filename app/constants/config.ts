const DEV_LOCAL = "http://192.168.100.254:3000";
const DEV_NGROK = "https://uncheapened-untrafficked-lyric.ngrok-free.dev ";
const PRODUCTION = "https://your-production-server.com";

export const ENVIRONMENTS = { DEV_LOCAL, DEV_NGROK, PRODUCTION } as const;

// Change this one line when switching environments
export const API_URL = "https://uncheapened-untrafficked-lyric.ngrok-free.dev";
export const API_KEY = "pesosense_secret_2024";

export const SUPABASE_URL = "https://ruyyrnixuclltdskngqr.supabase.co/rest/v1/";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1eXlybml4dWNsbHRkc2tuZ3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDU1OTYsImV4cCI6MjA5MjU4MTU5Nn0.Bj9gcANZI20rIoHI6i16KUrJV5IY1Y0I-biVtmz2Mnk";
