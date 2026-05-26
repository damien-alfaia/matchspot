import { Link } from 'react-router-dom';
import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { EnTeteSEO } from '../composants/EnTeteSEO';

export function PageAPropos() {
  return (
    <div className="min-h-screen bg-slate-50">
      <EnTeteSEO
        titre="À propos | MatchSpot"
        description="MatchSpot est une plateforme française qui aide bars et clients à se trouver autour des matchs de la Coupe du Monde 2026. Notre histoire, notre mission."
      />
      <Entete />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
          À propos
        </p>
        <h1 className="mt-1 text-4xl font-extrabold text-marine-900">
          Trouver un bar pour le match
          <br />
          ne devrait pas être un casse-tête.
        </h1>

        <div className="prose prose-marine mt-8 max-w-none space-y-5 text-marine-700">
          <p>
            La Coupe du Monde 2026 se joue en Amérique du Nord. Les matchs
            commencent tard pour nous, parfois à 3 h du matin. Trouver un bar
            qui les diffuse, qui a encore de la place, et qui sera ambiance
            quand le but tombe : aujourd'hui ça veut dire compulser dix
            comptes Instagram, appeler trois fois, et croiser les doigts en
            poussant la porte.
          </p>
          <p>
            <strong>MatchSpot regroupe au même endroit les bars qui
            diffusent la CdM 2026 en France</strong>, leur capacité, leurs
            horaires dans votre fuseau, et un bouton pour réserver. Côté
            patron de bar, c'est un outil pour gérer sereinement ses
            soirées : capacité paramétrable, réservations en temps réel,
            confirmations email automatiques. Pas de paperasse, pas de
            tableurs Excel partagés.
          </p>
          <p>
            On démarre en France pour la CdM 2026. Si ça marche, on
            continuera sur l'Euro 2028 et les autres grandes compétitions.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-marine-900">
            Ce qu'on ne fait pas
          </h2>
          <p>
            On n'est pas un annuaire publicitaire. Les bars ne payent pas
            pour être mieux référencés. Le classement dans les résultats se
            fait par distance (si vous avez activé la géolocalisation) ou par
            ordre alphabétique. Pas de placement payant, pas de bouton « Pro »
            qui rachète le haut de la liste.
          </p>
          <p>
            On ne fait pas non plus d'avis ni de notes. L'expérience d'un soir
            de match dépend trop de l'ambiance — un bar qui était bondé et
            génial pour France-Argentine peut être vide et triste pour
            Belgique-Iran. Les avis figés sur 5 étoiles donnent rarement la
            bonne image. On préfère vous donner les bonnes infos pratiques et
            vous laisser tester.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-marine-900">
            Comment c'est financé
          </h2>
          <p>
            Pendant la CdM 2026, l'inscription des bars est <strong>gratuite,
            sans engagement</strong>. À partir de l'automne, on proposera des
            formules optionnelles (analytics, multi-bars, branding
            personnalisé). Les fonctionnalités essentielles resteront
            gratuites pour ne pas créer de barrière à l'entrée.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-marine-900">
            Qui est derrière
          </h2>
          <p>
            MatchSpot est un projet indépendant porté par une équipe réduite
            basée en France. On code, on déploie, on prend les retours
            utilisateurs en direct. Une question, une suggestion, un bug ?
            Écrivez-nous à{' '}
            <a
              href="mailto:contact@matchspot.fr"
              className="font-semibold text-bleu-600 hover:underline"
            >
              contact@matchspot.fr
            </a>{' '}
            — on lit tout et on répond.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/" className="bouton-primaire">
            Chercher un bar
          </Link>
          <Link to="/comment-ca-marche-bar" className="bouton-secondaire">
            Inscrire mon bar
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
