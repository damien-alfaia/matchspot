import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DiffusionAvecMatch, Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';
import { FormulaireDiffusion } from '../composants/FormulaireDiffusion';
import { FormulaireEtablissement } from '../composants/FormulaireEtablissement';
import { ListeDiffusions } from '../composants/ListeDiffusions';
import { PanneauReservations } from '../composants/PanneauReservations';
import { SqueletteLigne, SqueletteListe } from '../composants/ui/Squelette';

export function PageEtablissement() {
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const naviguer = useNavigate();
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [diffusions, setDiffusions] = useState<DiffusionAvecMatch[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [editionOuverte, setEditionOuverte] = useState(false);
  const [enSuppression, setEnSuppression] = useState(false);

  async function supprimerEtablissement() {
    if (!etablissement) return;
    const confirme = window.confirm(
      `Supprimer définitivement « ${etablissement.nom} » ?\n\nCette action est irréversible. Toutes les diffusions et réservations associées seront également supprimées.`,
    );
    if (!confirme) return;
    setEnSuppression(true);
    setErreur(null);
    const { error } = await supabase
      .from('etablissements')
      .delete()
      .eq('id', etablissement.id);
    setEnSuppression(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    naviguer('/tableau-de-bord');
  }

  const chargerEtablissement = useCallback(async () => {
    if (!etablissementId) return;
    const { data, error } = await supabase
      .from('etablissements')
      .select('*')
      .eq('id', etablissementId)
      .single();
    if (error) {
      setErreur(error.message);
    } else {
      setEtablissement(data);
    }
  }, [etablissementId]);

  const chargerDiffusions = useCallback(async () => {
    if (!etablissementId) return;
    const { data, error } = await supabase
      .from('diffusions')
      .select('*, matchs(*)')
      .eq('etablissement_id', etablissementId)
      .order('cree_le', { ascending: false });
    if (error) {
      setErreur(error.message);
    } else {
      setDiffusions((data ?? []) as DiffusionAvecMatch[]);
    }
  }, [etablissementId]);

  useEffect(() => {
    let actif = true;
    (async () => {
      await Promise.all([chargerEtablissement(), chargerDiffusions()]);
      if (actif) setChargement(false);
    })();
    return () => {
      actif = false;
    };
  }, [chargerEtablissement, chargerDiffusions]);

  const matchsProgrammes = useMemo(
    () => new Set(diffusions.map((d) => d.match_id)),
    [diffusions],
  );

  const diffusionIds = useMemo(
    () => diffusions.map((d) => d.id),
    [diffusions],
  );

  if (chargement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
        <Entete />
        <main
          id="contenu-principal"
          tabIndex={-1}
          className="mx-auto max-w-5xl space-y-6 px-4 py-8"
          aria-busy="true"
        >
          <SqueletteLigne width="w-2/3" height="h-8" />
          <SqueletteLigne width="w-1/3" height="h-4" />
          <SqueletteListe nombre={3} labelChargement="Chargement de l'établissement…" />
        </main>
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
        <Entete />
        <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8">
          <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {erreur ?? 'Établissement introuvable.'}
          </p>
          <p className="mt-4">
            <Link to="/tableau-de-bord" className="text-bleu-700 hover:underline">
              ← Retour à la liste
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
      <Entete />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <header>
          <Link
            to="/tableau-de-bord"
            className="text-sm font-medium text-bleu-600 hover:text-bleu-700"
          >
            ← Mes établissements
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-marine-900 dark:text-marine-50">
                {etablissement.nom}
              </h1>
              {etablissement.adresse && (
                <p className="mt-0.5 text-sm text-marine-500 dark:text-marine-400">
                  {etablissement.adresse}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="badge bg-marine-50 dark:bg-marine-800 text-marine-700 dark:text-marine-200">
                🕐 {etablissement.fuseau_horaire}
              </span>
              <span className="badge bg-bleu-50 dark:bg-bleu-950/40 text-bleu-700">
                {etablissement.capacite} places
              </span>
              <Link
                to={`/etablissements/${etablissement.slug_public}`}
                className="badge bg-marine-800 text-white hover:bg-marine-900"
                target="_blank"
                rel="noreferrer"
              >
                Voir la page publique ↗
              </Link>
              <button
                type="button"
                onClick={() => setEditionOuverte((x) => !x)}
                className="bouton-secondaire"
              >
                {editionOuverte ? 'Fermer l’édition' : 'Éditer le bar'}
              </button>
              <button
                type="button"
                onClick={supprimerEtablissement}
                disabled={enSuppression}
                className="bouton-danger"
              >
                {enSuppression ? 'Suppression…' : 'Supprimer le bar'}
              </button>
            </div>
          </div>
        </header>

        {erreur && (
          <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {erreur}
          </p>
        )}

        {editionOuverte && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-marine-900 dark:text-marine-50">
              Modifier les informations
            </h2>
            <FormulaireEtablissement
              initial={etablissement}
              organisationId={etablissement.organisation_id}
              modeEdition
              onTermine={(maj) => {
                setEtablissement(maj);
                setEditionOuverte(false);
              }}
              onAnnuler={() => setEditionOuverte(false)}
            />
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section>
            <h2 className="mb-3 text-lg font-bold text-marine-900 dark:text-marine-50">
              Diffusions programmées
            </h2>
            <ListeDiffusions
              etablissement={etablissement}
              diffusions={diffusions}
              onChangement={chargerDiffusions}
            />
          </section>

          <aside>
            <FormulaireDiffusion
              etablissement={etablissement}
              matchsDejaProgrammes={matchsProgrammes}
              onCree={chargerDiffusions}
            />
          </aside>
        </div>

        <PanneauReservations
          diffusionIds={diffusionIds}
          fuseau={etablissement.fuseau_horaire}
        />
      </main>
    </div>
  );
}
