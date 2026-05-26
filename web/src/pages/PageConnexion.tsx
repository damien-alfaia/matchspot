import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexte/SessionContexte';
import { Entete } from '../composants/Entete';

// Page de CONNEXION uniquement. L'inscription d'un nouveau bar passe par
// /inscription-pro qui crée compte Auth + organisation + premier
// établissement en une transaction via la RPC creer_organisation_bar_initial.
// Avoir deux chemins concurrents (signup direct ici + flow pro) créait des
// comptes orphelins sans organisation, qui se retrouvaient bloqués sur
// /tableau-de-bord sans bouton de création.

export function PageConnexion() {
  const { session, chargement } = useSession();
  const naviguer = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  if (chargement) {
    return null;
  }
  if (session) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });
    if (error) {
      setErreur(error.message);
    } else {
      naviguer('/tableau-de-bord');
    }
    setEnCours(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
      <Entete />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-md px-4 py-12">
        <div className="carte">
          <h1 className="text-xl font-semibold text-marine-900 dark:text-marine-50">Connexion</h1>
          <p className="mt-1 text-sm text-marine-500 dark:text-marine-400">
            Espace réservé au staff des bars et restaurants partenaires.
          </p>

          <form onSubmit={soumettre} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-marine-700 dark:text-marine-200">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="champ-saisie"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-marine-700 dark:text-marine-200">
                Mot de passe
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="champ-saisie"
                autoComplete="current-password"
              />
            </label>

            {erreur && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={enCours}
              className="bouton-primaire w-full"
            >
              {enCours ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2 text-center text-sm text-marine-500 dark:text-marine-400">
            <Link
              to="/mot-de-passe-oublie"
              className="text-bleu-700 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
            <p>
              Vous êtes un bar et pas encore inscrit ?{' '}
              <Link
                to="/inscription-pro"
                className="font-semibold text-bleu-700 hover:underline"
              >
                Créer un compte pro
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
