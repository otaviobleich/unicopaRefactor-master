import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mluwskcnvarmojonjumq.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uFhBcBjyWGKwRjgVdPJlyw_jyfBk2z0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});