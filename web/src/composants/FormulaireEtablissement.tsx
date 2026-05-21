import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { geocoderAdresse } from '../lib/geocodage';
import type { Etablissement } from '../types/base';

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
}

interface Props {
  initial?: Partial<Etablissement> & { telephone?: string | null; description_courte?: string | null; url_photo?: string | null };
  // Si fourni, le formulaire écrit lui-même en base et appelle onTermine.
  // Sinon, il déclègue à onSoumettre (utilisé par PageInscriptionPro).
  organisationId?: string;
  modeEdition?: boolean;
  onTermine?: (etab: Etablissement) => void;
  onSoumettre?: (valeurs: ValeursEtablissement) => Promise<void> | void;
  onAnnuler?: () => void;
}

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
  });
  const [enCours, setEnCours] = useState(false);
  const [enGeocodage, setEnGeocodage] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [enUpload, setEnUpload] = useState(false);

  // Auto-slug à partir du nom tant que l'utilisateur n'a pas édité le slug.
  const [slugTouche, setSlugTouche] = useState(modeEdition);
  useEffect(() => {
    if (!slugTouche && v.nom) {
      setV((x) => ({ ...x, slug_public: slugifier(v.nom) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.nom, slugTouche]);

  // Géocodage automatique sur perte de focus de l'adresse, avec debounce.
  async function geocoderMaintenant() {
    if (!v.adresse.trim()) return;
    setEnGeocodage(true);
    setInfo(null);
    const r = await geocoderAdresse(v.adresse);
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
  }

  async function uploaderPhoto(fichier: File) {
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
      return;
    }
    const { data } = supabase.storage
      .from('etablissements-photos')
      .getPublicUrl(chemin);
    setV((x) => ({ ...x, url_photo: data.publicUrl }));
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
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

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-marine-800">
            Adresse complète
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={v.adresse}
              onChange={(e) => setV({ ...v, adresse: e.target.value })}
              onBlur={geocoderMaintenant}
              className="champ-saisie flex-1"
              placeholder="12 rue de la Coupe, 75011 Paris"
            />
            <button
              type="button"
              onClick={geocoderMaintenant}
              disabled={enGeocodage || !v.adresse.trim()}
              className="bouton-secondaire whitespace-nowrap"
            >
              {enGeocodage ? 'Localisation…' : 'Géocoder'}
            </button>
          </div>
          <p className="mt-1 text-xs text-marine-500">
            © OpenStreetMap contributors — géocodage via Nominatim.
          </p>
        </label>

        <label className="block">
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
            pattern="[a-z0-9\\-]+"
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
          <p className="mt-1 text-right text-xs text-marine-400">
            {v.description_courte.length}/280
          </p>
        </label>

        <label className="block sm:col-span-2">
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
                alt="Aperçu"
                className="h-12 w-20 rounded object-cover"
              />
            )}
            {enUpload && <span className="text-xs text-marine-500">Upload…</span>}
          </div>
        </label>
      </div>

      {(v.latitude !== null || v.longitude !== null) && (
        <div className="rounded-lg bg-bleu-50 px-3 py-2 text-xs text-bleu-700">
          Position : {v.latitude?.toFixed(5)}, {v.longitude?.toFixed(5)}
        </div>
      )}
      {info && (
        <p className="rounded-md bg-bleu-50 px-3 py-2 text-sm text-bleu-700">
          {info}
        </p>
      )}
      {erreur && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {onAnnuler && (
          <button type="button" onClick={onAnnuler} className="bouton-secondaire">
            Annuler
          </button>
        )}
        <button type="submit" disabled={enCours} className="bouton-primaire">
          {enCours
            ? 'Enregistrement…'
            : modeEdition
              ? 'Enregistrer les modifications'
              : 'Créer l’établissement'}
        </button>
      </div>
    </form>
  );
}
