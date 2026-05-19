import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DiffusionAvecMatch, Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';
import { FormulaireDiffusion } from '../composants/FormulaireDiffusion';
import { ListeDiffusions } from '../composants/ListeDiffusions';
import { PanneauReservations } from '../composants/PanneauReservations';

export function PageEtablissement() {
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [diffusions, setDiffusions] = useState<DiffusionAvecMatch[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

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
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <p className="mx-auto max-w-5xl px-4 py-8 text-slate-500">Chargement…</p>
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur ?? 'Établissement introuvable.'}
          </p>
          <p className="mt-4">
            <Link to="/tableau-de-bord" className="text-terrain-700 hover:underline">
              ← Retour à la liste
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Entete />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link
              to="/tableau-de-bord"
              className="text-sm text-terrain-700 hover:underline"
            >
              ← Mes établissements
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {etablissement.nom}
            </h1>
            {etablissement.adresse && (
              <p className="text-sm text-slate-500">{etablissement.adresse}</p>
            )}
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>
              Fuseau :{' '}
              <span className="font-mono">{etablissement.fuseau_horaire}</span>
            </p>
            <p>Capacité : {etablissement.capacite} places</p>
            <p>
              Page publique :{' '}
              <Link
                to={`/etablissements/${etablissement.slug_public}`}
                className="text-terrain-700 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                /etablissements/{etablissement.slug_public}
              </Link>
            </p>
          </div>
        </header>

        {erreur && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
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
