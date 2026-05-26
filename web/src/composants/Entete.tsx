import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexte/SessionContexte';
import { BoutonTheme } from './ui/BoutonTheme';

export function Entete() {
  const { session } = useSession();
  const naviguer = useNavigate();
  const { pathname } = useLocation();
  const surFondMarine = pathname === '/';

  async function deconnecter() {
    await supabase.auth.signOut();
    naviguer('/');
  }

  return (
    <header
      className={
        surFondMarine
          ? 'border-b border-marine-900/0 bg-transparent'
          : 'border-b border-marine-100 bg-white/80 backdrop-blur dark:border-marine-700 dark:bg-marine-900/80'
      }
    >
      <a href="#contenu-principal" className="lien-evitement">
        Aller au contenu principal
      </a>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt="Logo MatchSpot"
            className="h-9 w-9 object-contain"
          />
          <span
            className={`text-lg font-bold tracking-tight ${
              surFondMarine
                ? 'text-white'
                : 'text-marine-800 dark:text-marine-50'
            }`}
          >
            Match<span className="text-bleu-500">Spot</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <BoutonTheme
            className={
              surFondMarine
                ? 'text-white'
                : 'text-marine-700 dark:text-marine-200'
            }
          />
          {session ? (
            <>
              <Link
                to="/tableau-de-bord"
                className={`hidden rounded-md px-3 py-2 font-medium transition sm:inline-flex ${
                  surFondMarine
                    ? 'text-white/90 hover:text-white'
                    : 'text-marine-700 hover:bg-marine-50 dark:text-marine-200 dark:hover:bg-marine-800'
                }`}
              >
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
            <Link
              to="/connexion"
              className={
                surFondMarine
                  ? 'inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20'
                  : 'bouton-primaire'
              }
            >
              Espace bar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
