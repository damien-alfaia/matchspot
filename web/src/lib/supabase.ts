import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const cleAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !cleAnon) {
  throw new Error(
    "Variables d'environnement manquantes : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY. " +
      'Copier web/.env.example vers web/.env.local et renseigner les valeurs.',
  );
}

export const supabase = createClient(url, cleAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
