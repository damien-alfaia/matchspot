import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';

export function PageTableauDeBord() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      const { data, error } = await supabase
        .from('etablissements')
        .select('*')
        .order('nom', { ascending: true });
      if (!actif) return;
      if (error) {
        setErreur(error.message);
      } else {
        setEtablissements(data ?? []);
      }
      setChargement(false);
    })();
    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Entete />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Mes établissements</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sélectionnez un établissement pour gérer ses soirées de diffusion.
        </p>

        {erreur && (
          <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        {chargement ? (
          <p className="mt-8 text-slate-500">Chargement…</p>
        ) : etablissements.length === 0 ? (
          <div className="mt-8 carte">
            <p className="text-sm text-slate-600">
              Aucun établissement n'est rattaché à votre compte. Demandez à
              votre administrateur de vous ajouter à une organisation.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {etablissements.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/tableau-de-bord/etablissements/${e.id}`}
                  className="block carte transition hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-slate-900">{e.nom}</h2>
                  {e.adresse && (
                    <p className="mt-1 text-sm text-slate-500">{e.adresse}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="badge bg-slate-100 border border-slate-200">
                      Fuseau : {e.fuseau_horaire}
                    </span>
                    <span className="badge bg-slate-100 border border-slate-200">
                      Capacité : {e.capacite}
                    </span>
                    <span className="badge bg-terrain-50 text-terrain-700 border border-terrain-500/30">
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
