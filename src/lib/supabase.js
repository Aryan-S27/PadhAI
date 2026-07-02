import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure 'export const' is lowercase and matches the name exactly
export const supabase = createClient(supabaseUrl, supabaseAnonKey);