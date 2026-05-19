import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ValeurSession {
  session: Session | null;
  chargement: boolean;
}

const SessionContexte = createContext<ValeurSession | undefined>(undefined);

export function FournisseurSession({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChargement(false);
    });

    const { data: ecoute } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });

    return () => {
      ecoute.subscription.unsubscribe();
    };
  }, []);

  const valeur = useMemo(() => ({ session, chargement }), [session, chargement]);

  return (
    <SessionContexte.Provider value={valeur}>
      {children}
    </SessionContexte.Provider>
  );
}

export function useSession(): ValeurSession {
  const ctx = useContext(SessionContexte);
  if (!ctx) {
    throw new Error('useSession doit être utilisé dans FournisseurSession.');
  }
  return ctx;
}
