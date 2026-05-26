import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// Trois modes utilisateur :
//   - 'clair'   : forçage clair
//   - 'sombre'  : forçage sombre
//   - 'systeme' : suit prefers-color-scheme de l'OS (défaut)
//
// On stocke le choix utilisateur dans localStorage. La classe `.dark`
// est appliquée sur <html> pour activer les variantes Tailwind `dark:`.
//
// Pour éviter un flash de thème incorrect au chargement, un mini script
// inline dans index.html applique la classe avant que React ne monte.

export type Theme = 'clair' | 'sombre' | 'systeme';

interface ContexteTheme {
  /** Préférence utilisateur (peut être 'systeme'). */
  theme: Theme;
  /** Thème effectivement appliqué (jamais 'systeme'). */
  themeEffectif: 'clair' | 'sombre';
  setTheme: (t: Theme) => void;
  /** Bascule clair ↔ sombre (sort du mode systeme s'il y était). */
  basculer: () => void;
}

const Ctx = createContext<ContexteTheme | undefined>(undefined);
const CLE_STOCKAGE = 'matchspot.theme';

function lireSysteme(): 'clair' | 'sombre' {
  if (typeof window === 'undefined') return 'clair';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'sombre'
    : 'clair';
}

function appliquerClasse(effectif: 'clair' | 'sombre') {
  if (typeof document === 'undefined') return;
  const racine = document.documentElement;
  if (effectif === 'sombre') racine.classList.add('dark');
  else racine.classList.remove('dark');
}

function lireStockage(): Theme {
  if (typeof window === 'undefined') return 'systeme';
  const v = window.localStorage.getItem(CLE_STOCKAGE);
  if (v === 'clair' || v === 'sombre' || v === 'systeme') return v;
  return 'systeme';
}

export function FournisseurTheme({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => lireStockage());
  const [systemePref, setSystemePref] = useState<'clair' | 'sombre'>(() =>
    lireSysteme(),
  );

  const themeEffectif: 'clair' | 'sombre' =
    theme === 'systeme' ? systemePref : theme;

  // Applique la classe à chaque changement.
  useEffect(() => {
    appliquerClasse(themeEffectif);
  }, [themeEffectif]);

  // Écoute les changements de prefers-color-scheme (utile uniquement si
  // l'utilisateur est en mode 'systeme').
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) =>
      setSystemePref(e.matches ? 'sombre' : 'clair');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function setTheme(t: Theme) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CLE_STOCKAGE, t);
    }
    setThemeState(t);
  }

  function basculer() {
    setTheme(themeEffectif === 'sombre' ? 'clair' : 'sombre');
  }

  const valeur = useMemo<ContexteTheme>(
    () => ({ theme, themeEffectif, setTheme, basculer }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, themeEffectif],
  );

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useTheme doit être utilisé dans <FournisseurTheme>.');
  }
  return ctx;
}
