import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Entete } from '../composants/Entete';

type Mode = 'demande' | 'nouveau-mdp';

export function PageReinitialisation() {
  const naviguer = useNavigate();
  const [mode, setMode] = useState<Mode>('demande');
  const [email, setEmail] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  // Quand l'utilisateur arrive depuis le lien email Supabase, l'événement
  // PASSWORD_RECOVERY est émis et on lui propose de définir un nouveau mot
  // de passe.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('nouveau-mdp');
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function demanderLien(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    setInfo(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/mot-de-passe-oublie`,
    });
    setEnCours(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setInfo(
      "Un email vient d'être envoyé (s'il existe un compte associé). Cliquez sur le lien pour définir un nouveau mot de passe.",
    );
  }

  async function definirNouveauMdp(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    setInfo(null);

    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    setEnCours(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setInfo('Mot de passe modifié. Redirection…');
    setTimeout(() => naviguer('/tableau-de-bord'), 1500);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
      <Entete />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-md px-4 py-12">
        <div className="carte">
          <h1 className="text-xl font-bold text-marine-900 dark:text-marine-50">
            {mode === 'demande'
              ? 'Mot de passe oublié'
              : 'Définir un nouveau mot de passe'}
          </h1>

          {mode === 'demande' ? (
            <form onSubmit={demanderLien} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-marine-800 dark:text-marine-100">
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

              {erreur && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {erreur}
                </p>
              )}
              {info && (
                <p className="rounded-md bg-bleu-50 dark:bg-bleu-950/40 px-3 py-2 text-sm text-bleu-700">
                  {info}
                </p>
              )}

              <button
                type="submit"
                disabled={enCours}
                className="bouton-primaire w-full"
              >
                {enCours ? 'Envoi…' : "Recevoir le lien"}
              </button>
            </form>
          ) : (
            <form onSubmit={definirNouveauMdp} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-marine-800 dark:text-marine-100">
                  Nouveau mot de passe (8 caractères min.)
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={nouveauMdp}
                  onChange={(e) => setNouveauMdp(e.target.value)}
                  className="champ-saisie"
                  autoComplete="new-password"
                />
              </label>

              {erreur && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {erreur}
                </p>
              )}
              {info && (
                <p className="rounded-md bg-bleu-50 dark:bg-bleu-950/40 px-3 py-2 text-sm text-bleu-700">
                  {info}
                </p>
              )}

              <button
                type="submit"
                disabled={enCours}
                className="bouton-primaire w-full"
              >
                {enCours ? 'Mise à jour…' : 'Définir le nouveau mot de passe'}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-marine-500 dark:text-marine-400">
            <Link to="/connexion" className="text-bleu-600 hover:underline">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
