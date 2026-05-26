import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';
import { FormulaireEtablissement } from '../composants/FormulaireEtablissement';
import { SqueletteListe } from '../composants/ui/Squelette';

export function PageTableauDeBord() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [creationOuverte, setCreationOuverte] = useState(false);

  const charger = useCallback(async () => {
    const { data, error } = await supabase
      .from('etablissements')
      .select('*')
      .order('nom', { ascending: true });
    if (error) {
      setErreur(error.message);
    } else {
      const liste = (data ?? []) as Etablissement[];
      setEtablissements(liste);
      if (liste.length > 0) setOrganisationId(liste[0].organisation_id);
      else {
        // Pas d'établissement : on tente de récupérer une adhésion pour
        // connaître l'organisation.
        const { data: adhesions } = await supabase
          .from('adhesions')
          .select('organisation_id')
          .limit(1)
          .maybeSingle();
        if (adhesions) setOrganisationId(adhesions.organisation_id);
      }
    }
    setChargement(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
      <Entete />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
              Espace pro
            </p>
            <h1 className="mt-1 text-3xl font-bold text-marine-900 dark:text-marine-50">
              Mes établissements
            </h1>
            <p className="mt-1 text-sm text-marine-600 dark:text-marine-300">
              Sélectionnez un établissement pour piloter ses soirées de diffusion
              et ses réservations.
            </p>
          </div>
          {organisationId && (
            <button
              type="button"
              onClick={() => setCreationOuverte((x) => !x)}
              className="bouton-primaire"
            >
              {creationOuverte ? 'Fermer' : '+ Nouvel établissement'}
            </button>
          )}
        </div>

        {erreur && (
          <p className="mt-6 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {erreur}
          </p>
        )}

        {creationOuverte && organisationId && (
          <div className="mt-6">
            <FormulaireEtablissement
              organisationId={organisationId}
              onTermine={() => {
                setCreationOuverte(false);
                void charger();
              }}
              onAnnuler={() => setCreationOuverte(false)}
            />
          </div>
        )}

        {chargement ? (
          <div className="mt-10">
            <SqueletteListe nombre={2} labelChargement="Chargement de vos établissements…" />
          </div>
        ) : etablissements.length === 0 && !organisationId ? (
          <div className="mt-10 carte text-center">
            <p className="text-base font-semibold text-marine-900 dark:text-marine-50">
              Finalisez votre inscription pour créer votre premier
              établissement.
            </p>
            <p className="mt-2 text-sm text-marine-600 dark:text-marine-300">
              Votre compte est créé mais aucune organisation n'y est encore
              rattachée. Continuez votre inscription pour configurer votre
              bar (nom, adresse, capacité, fuseau).
            </p>
            <Link to="/inscription-pro" className="bouton-primaire mt-5 inline-flex">
              Finaliser mon inscription
            </Link>
          </div>
        ) : etablissements.length === 0 ? (
          <div className="mt-10 carte text-center">
            <p className="text-sm text-marine-600 dark:text-marine-300">
              Aucun établissement n'est rattaché à votre compte. Cliquez sur
              « Nouvel établissement » pour en créer un.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {etablissements.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/tableau-de-bord/etablissements/${e.id}`}
                  className="carte-interactive group block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-marine-900 dark:text-marine-50 group-hover:text-bleu-600">
                      {e.nom}
                    </h2>
                    <span className="badge bg-bleu-50 dark:bg-bleu-950/40 text-bleu-700">
                      {e.capacite} places
                    </span>
                  </div>
                  {e.adresse && (
                    <p className="mt-1 text-sm text-marine-500 dark:text-marine-400">{e.adresse}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="badge bg-marine-50 dark:bg-marine-800 text-marine-700 dark:text-marine-200">
                      🕐 {e.fuseau_horaire}
                    </span>
                    <span className="badge bg-bleu-50 dark:bg-bleu-950/40 text-bleu-700">
                      /etablissements/{e.slug_public}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
