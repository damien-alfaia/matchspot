import { Link } from 'react-router-dom';
import { Entete } from '../composants/Entete';

export function PageAccueil() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Entete />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Gérez vos soirées Coupe du Monde 2026
          <br />
          sans casse-tête de fuseau horaire.
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          MatchDay aide les bars et restaurants à choisir les matchs diffusés,
          à fixer la capacité de chaque soirée et à collecter les réservations
          de leurs clients. Les horaires des 104 matchs sont automatiquement
          convertis dans votre fuseau.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/connexion" className="bouton-primaire">
            Accéder à mon tableau de bord
          </Link>
        </div>
        <p className="mt-12 text-sm text-slate-500">
          Vous êtes client ? Trouvez la page publique de votre bar préféré à
          l'adresse <code className="font-mono">/etablissements/&lt;nom-du-bar&gt;</code>.
        </p>
      </main>
    </div>
  );
}
