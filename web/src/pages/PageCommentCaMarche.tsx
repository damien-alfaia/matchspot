import { Link } from 'react-router-dom';
import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { EnTeteSEO } from '../composants/EnTeteSEO';

// `children` est un mot-clé imposé par React/JSX, on garde l'anglais.

interface EtapeProps {
  numero: number;
  titre: string;
  children: React.ReactNode;
}

function Etape({ numero, titre, children }: EtapeProps) {
  return (
    <li className="relative pl-12">
      <span className="absolute left-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bleu-500 text-sm font-bold text-white">
        {numero}
      </span>
      <h3 className="text-lg font-bold text-marine-900">{titre}</h3>
      <div className="mt-1 text-marine-700">{children}</div>
    </li>
  );
}

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

function FaqItem({ question, children }: FaqItemProps) {
  return (
    <details className="group rounded-xl border border-marine-100 bg-white p-4 open:shadow-carte">
      <summary className="cursor-pointer list-none font-semibold text-marine-900 marker:hidden">
        <span className="mr-2 inline-block text-bleu-500 transition group-open:rotate-90">
          ›
        </span>
        {question}
      </summary>
      <div className="mt-3 text-sm text-marine-700">{children}</div>
    </details>
  );
}

export function PageCommentCaMarche() {
  return (
    <div className="min-h-screen bg-slate-50">
      <EnTeteSEO
        titre="Comment ça marche pour les bars | MatchSpot"
        description="Inscrivez votre bar gratuitement sur MatchSpot pour la Coupe du Monde 2026. Diffusions, capacité, réservations en ligne. Sans engagement, sans paperasse."
      />
      <div className="bg-heroMarine text-white">
        <Entete />
        <header className="mx-auto max-w-3xl px-4 pb-12 pt-8 text-center sm:pb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-bleu-200">
            Pour les bars et restaurants
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Remplissez votre salle
            <br />
            pour la Coupe du Monde 2026.
          </h1>
          <p className="mt-4 text-base text-marine-100 sm:text-lg">
            Visibilité, réservations en ligne et gestion temps réel.
            <br />
            Gratuit pendant la CdM, sans engagement, sans paperasse.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/inscription-pro"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-base font-semibold text-marine-900 shadow-sm transition hover:bg-marine-50"
            >
              Inscrire mon bar
            </Link>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-3xl space-y-12 px-4 py-12">
        <section>
          <h2 className="text-2xl font-bold text-marine-900">
            Comment ça marche, en 4 étapes
          </h2>
          <ol className="mt-6 space-y-6">
            <Etape numero={1} titre="Vous créez votre compte en 2 minutes">
              <p>
                Email professionnel, mot de passe, et c'est parti. Pas de
                carte bleue demandée, pas de devis à signer. Vous saisissez
                ensuite les infos de votre établissement (nom, adresse,
                fuseau horaire, capacité). L'adresse est géocodée
                automatiquement pour permettre aux clients de vous trouver
                en mode « bars autour de moi ».
              </p>
            </Etape>
            <Etape numero={2} titre="Vous choisissez les matchs que vous diffusez">
              <p>
                Les 104 matchs de la CdM 2026 sont préchargés avec leurs
                horaires affichés dans <strong>votre fuseau</strong>. Vous
                cochez ceux que vous diffusez, vous définissez le nombre de
                places réservables, et vous publiez en un clic. Vous pouvez
                modifier à tout moment.
              </p>
            </Etape>
            <Etape
              numero={3}
              titre="Vos clients vous trouvent et réservent en ligne"
            >
              <p>
                Votre bar apparaît dans les résultats de recherche par
                match et par ville. Chaque match a aussi sa propre page qui
                liste tous les bars qui le diffusent. Le client réserve sa
                place sans créer de compte, en 30 secondes.
              </p>
            </Etape>
            <Etape numero={4} titre="Vous gérez les réservations en temps réel">
              <p>
                Chaque nouvelle réservation arrive dans votre tableau de
                bord et déclenche un email instantané vers le client
                <em>et</em> vers vous. Vous confirmez ou annulez en un clic.
                Le décompte des places se met à jour automatiquement côté
                public — pas de double-booking.
              </p>
            </Etape>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-marine-900">
            Questions fréquentes
          </h2>
          <div className="mt-6 space-y-3">
            <FaqItem question="C'est vraiment gratuit ?">
              <p>
                Oui. Pendant toute la CdM 2026, l'inscription, la
                publication des diffusions, et la prise de réservations
                sont 100 % gratuites. Aucune carte bleue demandée.
              </p>
              <p className="mt-2">
                À partir de l'automne 2026, on proposera des formules
                optionnelles (analytics, multi-bars, branding
                personnalisé). Les fonctionnalités essentielles resteront
                gratuites pour les bars uniques. Vous pourrez décider à ce
                moment-là si vous voulez basculer.
              </p>
            </FaqItem>
            <FaqItem question="Combien de temps ça prend à mettre en place ?">
              <p>
                Création de compte + premier établissement : 2 à 3 minutes.
                Activer les diffusions des matchs que vous voulez : 1 à
                2 minutes par match. Vous pouvez tout faire la veille du
                premier match si vous voulez, mais l'idéal est de publier
                au moins une semaine avant pour que les clients aient le
                temps de réserver.
              </p>
            </FaqItem>
            <FaqItem question="Vous prenez une commission sur les réservations ?">
              <p>
                Non. Une réservation MatchSpot, c'est juste un client qui
                vous indique combien il vient être. Pas de paiement en
                ligne pour l'instant, pas d'arrhes prélevées, pas de
                commission. Vous gérez l'encaissement à l'ancienne, au
                comptoir.
              </p>
            </FaqItem>
            <FaqItem question="Et si je veux arrêter ?">
              <p>
                Vous pouvez désactiver votre page publique à tout moment
                depuis votre tableau de bord. Toutes vos données restent
                disponibles à l'export jusqu'à ce que vous demandiez leur
                suppression définitive (par email).
              </p>
            </FaqItem>
            <FaqItem question="Vous diffusez aussi les matchs autres que la CdM ?">
              <p>
                Pas dans cette version. MatchSpot démarre focus CdM 2026.
                Si ça marche bien, on ouvrira l'Euro 2028 et la Coupe de
                France. Si c'est important pour vous d'ajouter d'autres
                compétitions dès maintenant, écrivez-nous : on regarde au
                cas par cas.
              </p>
            </FaqItem>
            <FaqItem question="Comment vous gérez les données personnelles ?">
              <p>
                On collecte le strict minimum (email + nom du client à la
                réservation, votre email comme propriétaire). Hébergement
                Supabase (UE), envoi d'emails Resend, géocodage
                OpenStreetMap. Détail complet dans la{' '}
                <Link
                  to="/confidentialite"
                  className="font-semibold text-bleu-600 hover:underline"
                >
                  politique de confidentialité
                </Link>
                .
              </p>
            </FaqItem>
          </div>
        </section>

        <section className="rounded-2xl bg-marine-900 p-8 text-center text-white shadow-carte sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Prêt à remplir votre salle ?
          </h2>
          <p className="mt-2 text-marine-200">
            Inscription gratuite. 2 minutes. Aucune carte bleue.
          </p>
          <Link
            to="/inscription-pro"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-bleu-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-bleu-400"
          >
            Inscrire mon bar maintenant
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
