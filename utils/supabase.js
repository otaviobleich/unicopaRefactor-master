/**
 * utils/supabase.js
 *
 * CORREÇÕES APLICADAS:
 * 1. Polyfill de URL importado aqui (resolve "Network request failed" no Android)
 * 2. detectSessionInUrl: false  → obrigatório no React Native
 * 3. AsyncStorage como storage  → mantém sessão entre aberturas do app
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️  Troque pelos valores do seu projeto em https://supabase.com/dashboard
const SUPABASE_URL      = 'https://mluwskcnvarmojonjumq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdXdza2NudmFybW9qb25qdW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjM1MDQsImV4cCI6MjA5NDE5OTUwNH0.dQmzJdsq-OIaTHQDkBxVqxJVS5orWwScGrR8Cm8U2Io';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage, // persiste a sessão no dispositivo
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,        // OBRIGATÓRIO no React Native / Expo
  },
});