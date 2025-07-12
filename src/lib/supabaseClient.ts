import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores do seu projeto Supabase
const supabaseUrl = 'https://tfppoqqjmtfluzwwpuig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcHBvcXFqbXRmbHV6d3dwdWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NDg2MDcsImV4cCI6MjA2NTIyNDYwN30.BkIqGChr8Vt3XyJ0xk7-WaAXbcbz1EKWBNDblJfSJ_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 