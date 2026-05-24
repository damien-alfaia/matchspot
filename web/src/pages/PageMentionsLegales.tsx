import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { EnTeteSEO } from '../composants/EnTeteSEO';

// IMPORTANT : les champs entre [crochets] sont des placeholders à remplir
// par l'éditeur du site avant la mise en production (raison sociale,
// SIRET, etc.). Voir le commentaire dans le fichier pour la liste exacte.

export function PageMentionsLegales() {
  return (
    <div className="min-h-screen bg-slate-50">
      <EnTeteSEO
        titre="Mentions légales | MatchSpot"
        description="Mentions légales de MatchSpot, plateforme française de gestion de soirées de diffusion des matchs de la Coupe du Monde 2026."
      />
      <Entete />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
          Légal
        </p>
        <h1 className="mt-1 text-4xl font-extrabold text-marine-900">
          Mentions légales
        </h1>
        <p className="mt-3 text-sm text-marine-500">
          Dernière mise à jour : mai 2026.
        </p>

        <div className="mt-10 space-y-8 text-marine-700">
          <section>
            <h2 className="text-xl font-bold text-marine-900">Éditeur du site</h2>
            <p className="mt-2">
              MatchSpot — [Raison sociale à compléter]
              <br />
              [Forme juridique] au capital de [Montant] €
              <br />
              [Adresse postale du siège social]
              <br />
              [Code postal] [Ville], France
            </p>
            <p className="mt-2">
              SIRET : [Numéro SIRET à 14 chiffres]
              <br />
              RCS : [Ville d'immatriculation au RCS] [Numéro RCS]
              <br />
              TVA intracommunautaire : [FR + 11 chiffres]
            </p>
            <p className="mt-2">
              Directeur de la publication : [Nom Prénom du responsable]
              <br />
              Contact :{' '}
              <a
                href="mailto:bonjour@matchspot.fr"
                className="font-medium text-bleu-600 hover:underline"
              >
                bonjour@matchspot.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">Hébergement</h2>
            <p className="mt-2">
              Le site MatchSpot est hébergé par :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Application web</strong> : [Vercel Inc. ou Netlify
                Inc. — à préciser selon le déploiement effectif], adresse :
                [adresse du siège social de l'hébergeur].
              </li>
              <li>
                <strong>Base de données et authentification</strong> :
                Supabase, Inc., 970 Toa Payoh North #07-04, Singapore
                318992. Données hébergées sur la région Union Européenne.
              </li>
              <li>
                <strong>Envoi d'emails transactionnels</strong> : Resend,
                Inc., 2261 Market Street #4667, San Francisco, CA 94114,
                USA.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Propriété intellectuelle
            </h2>
            <p className="mt-2">
              Le logo MatchSpot, la charte graphique, les textes éditoriaux,
              le code source du front-end et l'architecture logicielle sont
              la propriété exclusive de l'éditeur du site. Toute
              reproduction, totale ou partielle, sans autorisation écrite
              préalable est interdite.
            </p>
            <p className="mt-2">
              Les informations relatives aux établissements partenaires
              (nom, adresse, capacité, photos, descriptions) sont fournies
              et/ou validées par chaque établissement. L'éditeur du site
              n'est pas responsable des inexactitudes éventuelles.
            </p>
            <p className="mt-2">
              Le calendrier officiel de la Coupe du Monde 2026 est issu de
              sources publiques (FIFA, Wikipédia). Voir le fichier{' '}
              <code className="font-mono text-bleu-700">
                docs/CALENDRIER.md
              </code>{' '}
              du dépôt source pour la liste complète des sources et la
              méthodologie de conversion des fuseaux horaires.
            </p>
            <p className="mt-2">
              Données de géocodage : © OpenStreetMap contributors, sous
              licence{' '}
              <a
                href="https://opendatacommons.org/licenses/odbl/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-bleu-600 hover:underline"
              >
                ODbL
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Limitation de responsabilité
            </h2>
            <p className="mt-2">
              MatchSpot est un service de mise en relation entre
              établissements (bars, restaurants) et clients souhaitant
              regarder un match. L'éditeur n'est ni partie ni garant des
              transactions ou prestations effectuées dans les
              établissements partenaires. Les conditions de réservation,
              les prix éventuels et la qualité du service relèvent de la
              seule responsabilité de l'établissement.
            </p>
            <p className="mt-2">
              L'éditeur s'efforce d'assurer la disponibilité et
              l'exactitude des informations diffusées mais ne peut garantir
              l'absence de toute erreur ou interruption du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Loi applicable et juridiction
            </h2>
            <p className="mt-2">
              Le présent site et toutes les relations contractuelles ou
              non avec ses utilisateurs sont régis par le droit français.
              Tout litige relèvera, à défaut d'accord amiable, des
              tribunaux français compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Données personnelles
            </h2>
            <p className="mt-2">
              Le traitement des données personnelles est décrit en détail
              dans notre{' '}
              <a
                href="/confidentialite"
                className="font-medium text-bleu-600 hover:underline"
              >
                politique de confidentialité
              </a>
              . Pour toute question ou demande d'exercice de vos droits,
              écrivez à{' '}
              <a
                href="mailto:bonjour@matchspot.fr"
                className="font-medium text-bleu-600 hover:underline"
              >
                bonjour@matchspot.fr
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
