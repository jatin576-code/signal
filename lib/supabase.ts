import { createClient } from '@supabase/supabase-js';

// SAFETY CHECK:
// If the environment variables are missing (like during the build phase),
// we use a dummy placeholder to prevent the "supabaseUrl is required" crash.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);