import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://coumyxguoznbhrivlxnw.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdW15eGd1b3puYmhyaXZseG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjI0NTAsImV4cCI6MjA5NjUzODQ1MH0.mp63Jzcy5-cx5EvxzDoEb7BleYvaPNxP4M6mPlC2CWY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
