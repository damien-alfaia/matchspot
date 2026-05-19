import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexte/SessionContexte';

export function Entete() {
  const { session } = useSession();
  const naviguer = useNavigate();

  async function deconnecter() {
    await supabase.auth.signOut();
    naviguer('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-terrain-900">
          <span className="text-2xl">⚽</span>
          <span className="text-lg">MatchDay</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link to="/tableau-de-bord" className="text-slate-700 hover:text-terrain-700">
                Tableau de bord
              </Link>
              <button
                type="button"
                onClick={deconnecter}
                className="bouton-secondaire"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link to="/connexion" className="bouton-primaire">
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
