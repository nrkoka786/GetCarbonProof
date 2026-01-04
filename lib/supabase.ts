
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vloxxhgyjexiytwqpcbx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb3h4aGd5amV4aXl0d3FwY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTAyNzAsImV4cCI6MjA4MzAyNjI3MH0.DQ9GicwxF2YwmzR-B0rY5yxPzEoTjwVkI1lo7XLWJvc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
