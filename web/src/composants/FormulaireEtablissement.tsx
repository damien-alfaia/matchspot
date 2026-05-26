import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { geocoderAdresse } from '../lib/geocodage';
import type { Etablissement, SonAmbiance } from '../types/base';

// Listes prédéfinies pour les multi-choix. L'utilisateur peut aussi ajouter
// ses propres tags libres dans equipes_habituelles via le champ texte.
const AMBIANCES_DISPONIBLES: ReadonlyArray<{ cle: string; libelle: string }> = [
  { cle: 'supporters', libelle: 'Ambiance supporters' },
  { cle: 'foule', libelle: 'Salle pleine, ça hurle' },
  { cle: 'apero', libelle: 'Apéro / convivial' },
  { cle: 'famille', libelle: 'Famille friendly' },
  { cle: 'chill', libelle: 'Chill / posé' },
  { cle: 'branche', libelle: 'Branché / cocktail' },
];

const NIVEAUX_SON: ReadonlyArray<{ valeur: SonAmbiance; libelle: string }> = [
  { valeur: 'calme', libelle: 'Calme (on parle facilement)' },
  { valeur: 'normal', libelle: 'Normal (un peu de bruit)' },
  { valeur: 'fort', libelle: 'Fort (faut hausser la voix)' },
  { valeur: 'crowd', libelle: 'Crowd (on ne s\'entend plus quand ça marque)' },
];

const JOURS_SEMAINE: ReadonlyArray<{ cle: string; libelle: string }> = [
  { cle: 'lundi', libelle: 'Lundi' },
  { cle: 'mardi', libelle: 'Mardi' },
  { cle: 'mercredi', libelle: 'Mercredi' },
  { cle: 'jeudi', libelle: 'Jeudi' },
  { cle: 'vendredi', libelle: 'Vendredi' },
  { cle: 'samedi', libelle: 'Samedi' },
  { cle: 'dimanche', libelle: 'Dimanche' },
];

// Quelques fuseaux courants pour la France et l'Amérique du Nord.
// L'utilisateur peut taper un autre fuseau IANA s'il veut.
const FUSEAUX_COURANTS = [
  'Europe/Paris',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Toronto',
] as const;

export interface ValeursEtablissement {
  nom: string;
  adresse: string;
  ville: string;
  fuseau_horaire: string;
  capacite: number;
  slug_public: string;
  latitude: number | null;
  longitude: number | null;
  telephone: string;
  description_courte: string;
  url_photo: string;
  nombre_ecrans: number | null;
  taille_ecrans: string;
  son_ambiance: SonAmbiance | null;
  type_ambiance: string[];
  equipes_habituelles: string[];
  photos_supplementaires: string[];
  horaires_ouverture: Record<string, string>;
}

interface Props {
  initial?: Partial<Etablissement>;
  // Si fourni, le formulaire écrit lui-même en base et appelle onTermine.
  // Sinon, il déclègue à onSoumettre (utilisé par PageInscriptionPro).
  organisationId?: string;
  modeEdition?: boolean;
  onTermine?: (etab: Etablissement) => void;
  onSoumettre?: (valeurs: ValeursEtablissement) => Promise<void> | void;
  onAnnuler?: () => void;
}

type NumEtape = 1 | 2 | 3 | 4;

const ETAPES: ReadonlyArray<{ num: NumEtape; titre: string; resume: string }> = [
  { num: 1, titre: 'Identité', resume: 'Nom, description, capacité' },
  { num: 2, titre: 'Adresse', resume: 'Localisation et géocodage' },
  { num: 3, titre: 'Le bar', resume: 'Écrans, ambiance, horaires' },
  { num: 4, titre: 'Photos', resume: 'Bandeau et carrousel' },
];

function slugifier(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function FormulaireEtablissement({
  initial,
  organisationId,
  modeEdition = false,
  onTermine,
  onSoumettre,
  onAnnuler,
}: Props) {
  const [v, setV] = useState<ValeursEtablissement>({
    nom: initial?.nom ?? '',
    adresse: initial?.adresse ?? '',
    ville: initial?.ville ?? '',
    fuseau_horaire: initial?.fuseau_horaire ?? 'Europe/Paris',
    capacite: initial?.capacite ?? 50,
    slug_public: initial?.slug_public ?? '',
    latitude: initial?.latitude ?? null,
    longitude: initial?.longitude ?? null,
    telephone: initial?.telephone ?? '',
    description_courte: initial?.description_courte ?? '',
    url_photo: initial?.url_photo ?? '',
    nombre_ecrans: initial?.nombre_ecrans ?? null,
    taille_ecrans: initial?.taille_ecrans ?? '',
    son_ambiance: initial?.son_ambiance ?? null,
    type_ambiance: initial?.type_ambiance ?? [],
    equipes_habituelles: initial?.equipes_habituelles ?? [],
    photos_supplementaires: initial?.photos_supplementaires ?? [],
    horaires_ouverture: initial?.horaires_ouverture ?? {},
  });
  const [equipeEnSaisie, setEquipeEnSaisie] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [enGeocodage, setEnGeocodage] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [enUpload, setEnUpload] = useState(false);
  const [etape, setEtape] = useState<NumEtape>(1);

  // Auto-slug à partir du nom tant que l'utilisateur n'a pas édité le slug.
  const [slugTouche, setSlugTouche] = useState(modeEdition);
  useEffect(() => {
    if (!slugTouche && v.nom) {
      setV((x) => ({ ...x, slug_public: slugifier(v.nom) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.nom, slugTouche]);

  // Géocodage automatique de l'adresse avec debounce (~800ms après la
  // dernière frappe). Nominatim limite à 1 req/s — 800ms est safe.
  useEffect(() => {
    const adresse = v.adresse.trim();
    if (!adresse) return;
    // Si la position vient déjà d'une adresse identique (mode édition initial),
    // pas besoin de regéocoder au montage.
    if (
      v.latitude !== null &&
      v.longitude !== null &&
      adresse === (initial?.adresse ?? '').trim()
    ) {
      return;
    }
    const timer = setTimeout(async () => {
      setEnGeocodage(true);
      setInfo(null);
      const r = await geocoderAdresse(adresse);
      setEnGeocodage(false);
      if (!r) {
        setInfo("Adresse non trouvée. Vous pouvez quand même continuer.");
        return;
      }
      setV((x) => ({
        ...x,
        latitude: r.latitude,
        longitude: r.longitude,
        ville: x.ville || r.ville || '',
      }));
      setInfo(`Position trouvée : ${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}.`);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.adresse]);

  async function uploaderVersStorage(fichier: File): Promise<string | null> {
    setEnUpload(true);
    setErreur(null);
    const ext = fichier.name.split('.').pop() ?? 'jpg';
    const chemin = `${crypto.randomUUID()}.${ext}`;
    const { error: errUp } = await supabase.storage
      .from('etablissements-photos')
      .upload(chemin, fichier, { cacheControl: '3600', upsert: false });
    setEnUpload(false);
    if (errUp) {
      setErreur(`Upload échoué : ${errUp.message}`);
      return null;
    }
    const { data } = supabase.storage
      .from('etablissements-photos')
      .getPublicUrl(chemin);
    return data.publicUrl;
  }

  async function uploaderPhoto(fichier: File) {
    const url = await uploaderVersStorage(fichier);
    if (url) setV((x) => ({ ...x, url_photo: url }));
  }

  async function uploaderPhotoSupplementaire(fichier: File) {
    const url = await uploaderVersStorage(fichier);
    if (url) {
      setV((x) => ({
        ...x,
        photos_supplementaires: [...x.photos_supplementaires, url],
      }));
    }
  }

  function supprimerPhotoSupplementaire(url: string) {
    setV((x) => ({
      ...x,
      photos_supplementaires: x.photos_supplementaires.filter((u) => u !== url),
    }));
  }

  function basculerAmbiance(cle: string) {
    setV((x) => ({
      ...x,
      type_ambiance: x.type_ambiance.includes(cle)
        ? x.type_ambiance.filter((c) => c !== cle)
        : [...x.type_ambiance, cle],
    }));
  }

  function ajouterEquipe() {
    const t = equipeEnSaisie.trim();
    if (!t) return;
    if (v.equipes_habituelles.includes(t)) {
      setEquipeEnSaisie('');
      return;
    }
    setV((x) => ({
      ...x,
      equipes_habituelles: [...x.equipes_habituelles, t],
    }));
    setEquipeEnSaisie('');
  }

  function retirerEquipe(t: string) {
    setV((x) => ({
      ...x,
      equipes_habituelles: x.equipes_habituelles.filter((e) => e !== t),
    }));
  }

  function changerHoraireJour(cle: string, valeur: string) {
    setV((x) => {
      const next = { ...x.horaires_ouverture };
      if (!valeur.trim()) {
        delete next[cle];
      } else {
        next[cle] = valeur;
      }
      return { ...x, horaires_ouverture: next };
    });
  }

  // Validation par étape : seule l'étape 1 a des champs vraiment obligatoires.
  function etape1Valide(): boolean {
    return (
      v.nom.trim().length > 0 &&
      v.slug_public.trim().length > 0 &&
      v.capacite > 0 &&
      v.fuseau_horaire.trim().length > 0
    );
  }

  function peutAccederA(num: NumEtape): boolean {
    if (modeEdition) return true;
    if (num === 1) return true;
    return etape1Valide();
  }

  function allerA(num: NumEtape) {
    if (!peutAccederA(num)) return;
    setErreur(null);
    setEtape(num);
  }

  function suivant() {
    if (etape === 1 && !etape1Valide()) {
      setErreur('Merci de remplir le nom, le slug, la capacité et le fuseau horaire.');
      return;
    }
    if (etape < 4) {
      allerA((etape + 1) as NumEtape);
    }
  }

  function precedent() {
    if (etape > 1) allerA((etape - 1) as NumEtape);
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    // Tant qu'on n'est pas à la dernière étape, "Entrée" ne soumet pas, il avance.
    if (etape < 4) {
      suivant();
      return;
    }
    setEnCours(true);
    setErreur(null);

    // Mode délégué : un autre composant prend en charge l'INSERT (cas
    // PageInscriptionPro avec la RPC creer_organisation_bar_initial).
    if (onSoumettre) {
      try {
        await onSoumettre(v);
      } catch (err) {
        setErreur(err instanceof Error ? err.message : 'Erreur inconnue.');
      }
      setEnCours(false);
      return;
    }

    if (!organisationId) {
      setErreur('Organisation manquante.');
      setEnCours(false);
      return;
    }

    const payload = {
      organisation_id: organisationId,
      nom: v.nom,
      adresse: v.adresse || null,
      ville: v.ville || null,
      fuseau_horaire: v.fuseau_horaire,
      capacite: v.capacite,
      slug_public: v.slug_public,
      latitude: v.latitude,
      longitude: v.longitude,
      telephone: v.telephone || null,
      description_courte: v.description_courte || null,
      url_photo: v.url_photo || null,
      nombre_ecrans: v.nombre_ecrans,
      taille_ecrans: v.taille_ecrans || null,
      son_ambiance: v.son_ambiance,
      type_ambiance: v.type_ambiance.length > 0 ? v.type_ambiance : null,
      equipes_habituelles:
        v.equipes_habituelles.length > 0 ? v.equipes_habituelles : null,
      photos_supplementaires:
        v.photos_supplementaires.length > 0 ? v.photos_supplementaires : null,
      horaires_ouverture:
        Object.keys(v.horaires_ouverture).length > 0
          ? v.horaires_ouverture
          : null,
    };

    let resultat;
    if (modeEdition && initial?.id) {
      resultat = await supabase
        .from('etablissements')
        .update(payload)
        .eq('id', initial.id)
        .select('*')
        .single();
    } else {
      resultat = await supabase
        .from('etablissements')
        .insert(payload)
        .select('*')
        .single();
    }

    setEnCours(false);
    if (resultat.error) {
      setErreur(resultat.error.message);
      return;
    }
    onTermine?.(resultat.data as Etablissement);
  }

  return (
    <form onSubmit={soumettre} className="carte space-y-5">
      {/* Barre de progression : 4 étapes, cliquable en mode édition. */}
      <ol
        className="flex flex-wrap items-center gap-2 border-b border-marine-100 pb-4"
        aria-label="Étapes du formulaire"
      >
        {ETAPES.map((e, idx) => {
          const actif = etape === e.num;
          const accessible = peutAccederA(e.num);
          const fait = e.num < etape;
          return (
            <li key={e.num} className="flex flex-1 items-center gap-2 min-w-[7rem]">
              <button
                type="button"
                onClick={() => allerA(e.num)}
                disabled={!accessible}
                aria-current={actif ? 'step' : undefined}
                className={`group flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                  actif
                    ? 'border-bleu-500 bg-bleu-50'
                    : fait
                      ? 'border-marine-200 bg-white hover:border-marine-300'
                      : 'border-marine-100 bg-white'
                } ${accessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    actif
                      ? 'bg-bleu-500 text-white'
                      : fait
                        ? 'bg-marine-800 text-white'
                        : 'bg-marine-100 text-marine-600'
                  }`}
                  aria-hidden="true"
                >
                  {fait ? '✓' : e.num}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-xs font-semibold ${
                      actif ? 'text-bleu-700' : 'text-marine-800'
                    }`}
                  >
                    {e.titre}
                  </span>
                  <span className="hidden text-[11px] text-marine-600 sm:block">
                    {e.resume}
                  </span>
                </span>
              </button>
              {idx < ETAPES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden h-px flex-1 bg-marine-100 sm:block"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Étape 1 : Identité */}
      {etape === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Nom de l'établissement
            </span>
            <input
              type="text"
              required
              value={v.nom}
              onChange={(e) => setV({ ...v, nom: e.target.value })}
              className="champ-saisie"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Téléphone
            </span>
            <input
              type="tel"
              value={v.telephone}
              onChange={(e) => setV({ ...v, telephone: e.target.value })}
              className="champ-saisie"
              placeholder="01 42 00 00 00"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Fuseau horaire (IANA)
            </span>
            <input
              type="text"
              list="liste-fuseaux"
              required
              value={v.fuseau_horaire}
              onChange={(e) => setV({ ...v, fuseau_horaire: e.target.value })}
              className="champ-saisie"
            />
            <datalist id="liste-fuseaux">
              {FUSEAUX_COURANTS.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Capacité (places)
            </span>
            <input
              type="number"
              min={1}
              required
              value={v.capacite}
              onChange={(e) => setV({ ...v, capacite: Number(e.target.value) })}
              className="champ-saisie"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Slug public (URL : /etablissements/<i>slug</i>)
            </span>
            <input
              type="text"
              required
              value={v.slug_public}
              onChange={(e) => {
                setSlugTouche(true);
                setV({ ...v, slug_public: slugifier(e.target.value) });
              }}
              className="champ-saisie font-mono"
              pattern="[a-z0-9\-]+"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Description courte (280 caractères max.)
            </span>
            <textarea
              rows={2}
              maxLength={280}
              value={v.description_courte}
              onChange={(e) => setV({ ...v, description_courte: e.target.value })}
              className="champ-saisie"
              placeholder="Bar sportif à Bastille, 3 écrans géants, snack…"
            />
            <p className="mt-1 text-right text-xs text-marine-600">
              {v.description_courte.length}/280
            </p>
          </label>
        </div>
      )}

      {/* Étape 2 : Adresse */}
      {etape === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Adresse complète
            </span>
            <input
              type="text"
              value={v.adresse}
              onChange={(e) => setV({ ...v, adresse: e.target.value })}
              className="champ-saisie"
              placeholder="12 rue de la Coupe, 75011 Paris"
            />
            <p className="mt-1 flex items-center gap-2 text-xs text-marine-600">
              <span>© OpenStreetMap contributors — géocodage automatique via Nominatim.</span>
              {enGeocodage && (
                <span className="text-bleu-700" aria-live="polite">
                  Localisation…
                </span>
              )}
            </p>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Ville
            </span>
            <input
              type="text"
              value={v.ville}
              onChange={(e) => setV({ ...v, ville: e.target.value })}
              className="champ-saisie"
              placeholder="Paris"
            />
          </label>

          {(v.latitude !== null || v.longitude !== null) && (
            <div className="sm:col-span-2 rounded-lg bg-bleu-50 px-3 py-2 text-xs text-bleu-700">
              Position : {v.latitude?.toFixed(5)}, {v.longitude?.toFixed(5)}
            </div>
          )}
          {info && (
            <p className="sm:col-span-2 rounded-md bg-bleu-50 px-3 py-2 text-sm text-bleu-700">
              {info}
            </p>
          )}
        </div>
      )}

      {/* Étape 3 : Le bar */}
      {etape === 3 && (
        <fieldset>
          <legend className="text-base font-bold text-marine-900">
            Le bar pour la diffusion
          </legend>
          <p className="mt-1 text-xs text-marine-600">
            Tous ces champs sont facultatifs mais améliorent fortement votre
            conversion : les clients veulent savoir avant de venir.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-marine-800">
                Nombre d'écrans
              </span>
              <input
                type="number"
                min={0}
                max={50}
                value={v.nombre_ecrans ?? ''}
                onChange={(e) =>
                  setV({
                    ...v,
                    nombre_ecrans: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="champ-saisie"
                placeholder="Ex : 5"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-marine-800">
                Taille / disposition (texte libre)
              </span>
              <input
                type="text"
                value={v.taille_ecrans}
                onChange={(e) => setV({ ...v, taille_ecrans: e.target.value })}
                className="champ-saisie"
                placeholder="1 grand écran 3m + 4 écrans 55 pouces"
              />
            </label>

            <div className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-marine-800">
                Niveau sonore les soirs de match
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NIVEAUX_SON.map((n) => (
                  <label
                    key={n.valeur}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-xs transition ${
                      v.son_ambiance === n.valeur
                        ? 'border-bleu-500 bg-bleu-50 text-bleu-700'
                        : 'border-marine-200 bg-white text-marine-700 hover:border-marine-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="son_ambiance"
                      value={n.valeur}
                      checked={v.son_ambiance === n.valeur}
                      onChange={() => setV({ ...v, son_ambiance: n.valeur })}
                      className="mt-0.5"
                    />
                    <span>{n.libelle}</span>
                  </label>
                ))}
              </div>
              {v.son_ambiance && (
                <button
                  type="button"
                  onClick={() => setV({ ...v, son_ambiance: null })}
                  className="mt-2 text-xs text-marine-600 underline hover:text-marine-800"
                >
                  Effacer le choix
                </button>
              )}
            </div>

            <div className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-marine-800">
                Type d'ambiance (plusieurs choix possibles)
              </span>
              <div className="flex flex-wrap gap-2">
                {AMBIANCES_DISPONIBLES.map((a) => {
                  const actif = v.type_ambiance.includes(a.cle);
                  return (
                    <button
                      key={a.cle}
                      type="button"
                      onClick={() => basculerAmbiance(a.cle)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        actif
                          ? 'border-bleu-500 bg-bleu-500 text-white'
                          : 'border-marine-200 bg-white text-marine-700 hover:border-marine-300'
                      }`}
                    >
                      {actif ? '✓ ' : '+ '}
                      {a.libelle}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-marine-800">
                Autres compétitions habituellement diffusées
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={equipeEnSaisie}
                  onChange={(e) => setEquipeEnSaisie(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ajouterEquipe();
                    }
                  }}
                  className="champ-saisie flex-1"
                  placeholder="Ligue 1, Champions League, NBA, Six Nations…"
                />
                <button
                  type="button"
                  onClick={ajouterEquipe}
                  disabled={!equipeEnSaisie.trim()}
                  className="bouton-secondaire whitespace-nowrap"
                >
                  + Ajouter
                </button>
              </div>
              {v.equipes_habituelles.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {v.equipes_habituelles.map((t) => (
                    <li
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full border border-marine-200 bg-white px-2.5 py-0.5 text-xs text-marine-700"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => retirerEquipe(t)}
                        className="text-marine-600 hover:text-red-600"
                        aria-label={`Retirer ${t}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-marine-800">
                Horaires d'ouverture
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {JOURS_SEMAINE.map((j) => (
                  <label key={j.cle} className="flex items-center gap-2">
                    <span className="w-20 text-xs text-marine-700">{j.libelle}</span>
                    <input
                      type="text"
                      value={v.horaires_ouverture[j.cle] ?? ''}
                      onChange={(e) => changerHoraireJour(j.cle, e.target.value)}
                      className="champ-saisie flex-1 text-sm"
                      placeholder="17h-2h ou fermé"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {/* Étape 4 : Photos */}
      {etape === 4 && (
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-marine-800">
              Photo (bandeau de la page publique)
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploaderPhoto(f);
                }}
                disabled={enUpload}
                className="text-sm"
              />
              {v.url_photo && (
                <img
                  src={v.url_photo}
                  alt="Aperçu du bandeau de l'établissement"
                  className="h-12 w-20 rounded object-cover"
                />
              )}
              {enUpload && <span className="text-xs text-marine-600">Upload…</span>}
            </div>
          </label>

          <div className="block">
            <span className="mb-2 block text-sm font-semibold text-marine-800">
              Photos supplémentaires (max 6, affichage carrousel)
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && v.photos_supplementaires.length < 6) {
                    void uploaderPhotoSupplementaire(f);
                  }
                  // reset l'input pour réuploader le même fichier si besoin
                  e.currentTarget.value = '';
                }}
                disabled={enUpload || v.photos_supplementaires.length >= 6}
                className="text-sm"
              />
              {enUpload && <span className="text-xs text-marine-600">Upload…</span>}
            </div>
            {v.photos_supplementaires.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {v.photos_supplementaires.map((url) => (
                  <li key={url} className="group relative">
                    <img
                      src={url}
                      alt="Photo supplémentaire de l'établissement"
                      className="h-16 w-24 rounded-md border border-marine-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => supprimerPhotoSupplementaire(url)}
                      className="absolute right-0 top-0 -mr-1 -mt-1 rounded-full bg-red-600 px-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                      aria-label="Supprimer la photo"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {erreur && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {erreur}
        </p>
      )}

      {/* Barre de navigation : Précédent / Suivant ou Soumettre à la dernière étape. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-marine-100 pt-4">
        <div className="flex gap-2">
          {onAnnuler && (
            <button type="button" onClick={onAnnuler} className="bouton-ghost">
              Annuler
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {etape > 1 && (
            <button type="button" onClick={precedent} className="bouton-secondaire">
              ← Précédent
            </button>
          )}
          {etape < 4 && (
            <button type="button" onClick={suivant} className="bouton-primaire">
              Suivant →
            </button>
          )}
          {etape === 4 && (
            <button type="submit" disabled={enCours} className="bouton-primaire">
              {enCours
                ? 'Enregistrement…'
                : modeEdition
                  ? 'Enregistrer les modifications'
                  : 'Créer l’établissement'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
