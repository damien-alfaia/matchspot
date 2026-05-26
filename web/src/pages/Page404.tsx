import { Link } from 'react-router-dom';
import { Entete } from '../composants/Entete';

export function Page404() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
      <Entete />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-6xl">⚽</p>
        <h1 className="mt-6 text-4xl font-extrabold text-marine-900 dark:text-marine-50">
          Page introuvable
        </h1>
        <p className="mt-3 text-marine-600 dark:text-marine-300">
          On a cherché partout, sur les 16 stades de la Coupe du Monde, et on
          n'a rien trouvé à cette adresse.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="bouton-primaire">
            Retour à l'accueil
          </Link>
          <Link to="/connexion" className="bouton-secondaire">
            Espace pro
          </Link>
        </div>
      </main>
    </div>
  );
}
