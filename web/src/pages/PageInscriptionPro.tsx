import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexte/SessionContexte';
import { Entete } from '../composants/Entete';
import {
  FormulaireEtablissement,
  type ValeursEtablissement,
} from '../composants/FormulaireEtablissement';

type Etape = 'compte' | 'bar';

function slugifier(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function PageInscriptionPro() {
  const { session, chargement } = useSession();
  const naviguer = useNavigate();

  const [etape, setEtape] = useState<Etape>('compte');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nomOrg, setNomOrg] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (chargement) return null;
  if (session && etape === 'compte') {
    // Si déjà connecté, on saute directement à l'étape 2.
    setEtape('bar');
  }

  async function creerCompte(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    setInfo(null);

    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
    });
    if (error) {
      setErreur(error.message);
      setEnCours(false);
      return;
    }

    // Connexion immédiate (au cas où la confirmation email n'est pas requise).
    const { error: errSignIn } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });
    if (errSignIn) {
      setInfo(
        "Compte créé. Vérifiez votre email pour confirmer puis revenez ici pour finaliser.",
      );
      setEnCours(false);
      return;
    }

    setEtape('bar');
    setEnCours(false);
  }

  async function creerOrganisationEtBar(v: ValeursEtablissement) {
    setErreur(null);

    const slugOrg = slugifier(nomOrg || v.nom);
    const { data, error } = await supabase.rpc('creer_organisation_bar_initial', {
      _nom_organisation: nomOrg || v.nom,
      _slug_organisation: `${slugOrg}-${Math.random().toString(36).slice(2, 6)}`,
      _nom_bar: v.nom,
      _slug_public_bar: v.slug_public,
      _adresse: v.adresse,
      _ville: v.ville,
      _fuseau_horaire: v.fuseau_horaire,
      _capacite: v.capacite,
      _latitude: v.latitude,
      _longitude: v.longitude,
    });

    if (error) {
      throw new Error(error.message);
    }
    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error("La création n'a rien renvoyé.");
    }

    // Optionnel : compléter les champs enrichis qui ne passent pas par la RPC.
    const ligne = Array.isArray(data) ? data[0] : data;
    if (v.telephone || v.description_courte || v.url_photo) {
      await supabase
        .from('etablissements')
        .update({
          telephone: v.telephone || null,
          description_courte: v.description_courte || null,
          url_photo: v.url_photo || null,
        })
        .eq('id', ligne.etablissement_id);
    }

    naviguer(`/tableau-de-bord/etablissements/${ligne.etablissement_id}`);
  }

  if (session && etape === 'bar') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
            Inscription pro — étape 2 sur 2
          </p>
          <h1 className="mt-1 text-3xl font-bold text-marine-900">
            Créez votre premier établissement
          </h1>
          <p className="mt-2 text-marine-600">
            On configure votre bar : adresse, capacité, fuseau, photo. Vous
            pourrez ajouter d'autres établissements ensuite depuis le tableau
            de bord.
          </p>

          <label className="mt-6 block">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Nom de votre groupe / société (optionnel — par défaut, même nom
              que le bar)
            </span>
            <input
              type="text"
              value={nomOrg}
              onChange={(e) => setNomOrg(e.target.value)}
              className="champ-saisie"
              placeholder="SARL Bistrot des Sports"
            />
          </label>

          <div className="mt-6">
            <FormulaireEtablissement onSoumettre={creerOrganisationEtBar} />
          </div>
        </main>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Entete />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="carte">
          <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
            Inscription pro — étape 1 sur 2
          </p>
          <h1 className="mt-1 text-2xl font-bold text-marine-900">
            Créez votre compte
          </h1>
          <p className="mt-1 text-sm text-marine-600">
            Réservé aux bars et restaurants qui veulent diffuser la Coupe du
            Monde 2026.
          </p>

          <form onSubmit={creerCompte} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-marine-800">
                Email professionnel
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
              <span className="mb-1 block text-sm font-semibold text-marine-800">
                Mot de passe (8 caractères min.)
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
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
              <p className="rounded-md bg-bleu-50 px-3 py-2 text-sm text-bleu-700">
                {info}
              </p>
            )}

            <button type="submit" disabled={enCours} className="bouton-primaire w-full">
              {enCours ? 'Création…' : 'Continuer'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-marine-500">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="font-semibold text-bleu-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
