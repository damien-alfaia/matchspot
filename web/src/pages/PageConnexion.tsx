import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexte/SessionContexte';
import { Entete } from '../composants/Entete';

type Mode = 'connexion' | 'inscription';

export function PageConnexion() {
  const { session, chargement } = useSession();
  const naviguer = useNavigate();
  const [mode, setMode] = useState<Mode>('connexion');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);

    if (mode === 'connexion') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: motDePasse,
      });
      if (error) {
        setErreur(error.message);
      } else {
        naviguer('/tableau-de-bord');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
      });
      if (error) {
        setErreur(error.message);
      } else {
        setMessage(
          'Compte créé. Si la confirmation par email est activée, vérifiez votre boîte avant de vous connecter.',
        );
      }
    }
    setEnCours(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Entete />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="carte">
          <h1 className="text-xl font-semibold text-slate-900">
            {mode === 'connexion' ? 'Connexion' : 'Création de compte'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Espace réservé au staff des bars et restaurants partenaires.
          </p>

          <form onSubmit={soumettre} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
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
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="champ-saisie"
                autoComplete={
                  mode === 'connexion' ? 'current-password' : 'new-password'
                }
              />
            </label>

            {erreur && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {erreur}
              </p>
            )}
            {message && (
              <p className="rounded-md bg-terrain-50 px-3 py-2 text-sm text-terrain-700">
                {message}
              </p>
            )}

            <button type="submit" disabled={enCours} className="bouton-primaire w-full">
              {enCours
                ? 'Veuillez patienter…'
                : mode === 'connexion'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            {mode === 'connexion' ? (
              <button
                type="button"
                onClick={() => setMode('inscription')}
                className="text-terrain-700 hover:underline"
              >
                Pas encore de compte ? S'inscrire
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('connexion')}
                className="text-terrain-700 hover:underline"
              >
                Déjà inscrit ? Se connecter
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
