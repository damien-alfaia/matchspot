import { Link } from 'react-router-dom';
import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { EnTeteSEO } from '../composants/EnTeteSEO';

export function PageConfidentialite() {
  return (
    <div className="min-h-screen bg-slate-50">
      <EnTeteSEO
        titre="Politique de confidentialité | MatchSpot"
        description="Comment MatchSpot collecte, utilise et protège vos données personnelles. Conformité RGPD, finalités, durées de conservation, droits d'accès."
      />
      <Entete />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
          Légal
        </p>
        <h1 className="mt-1 text-4xl font-extrabold text-marine-900">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-marine-500">
          Version applicable au 25 mai 2026.
        </p>

        <div className="mt-10 space-y-8 text-marine-700">
          <section>
            <h2 className="text-xl font-bold text-marine-900">En résumé</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                On collecte le strict minimum : votre email, votre nom, et
                la taille du groupe pour les réservations.
              </li>
              <li>
                On ne vend pas vos données. On ne fait pas de profilage
                publicitaire. On n'utilise pas de cookies de suivi tiers.
              </li>
              <li>
                Vos données sont hébergées sur Supabase (UE), envoyées par
                Resend pour les emails. C'est tout.
              </li>
              <li>
                Vous pouvez à tout moment demander l'accès, la rectification
                ou la suppression de vos données en écrivant à{' '}
                <a
                  href="mailto:contact@matchspot.fr"
                  className="font-medium text-bleu-600 hover:underline"
                >
                  contact@matchspot.fr
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Responsable du traitement
            </h2>
            <p className="mt-2">
              Le responsable du traitement des données est l'éditeur du
              site, dont les coordonnées figurent dans les{' '}
              <Link
                to="/mentions-legales"
                className="font-medium text-bleu-600 hover:underline"
              >
                mentions légales
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Données collectées et finalités
            </h2>
            <table className="mt-3 w-full border-collapse text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-marine-500">
                <tr className="border-b border-marine-100">
                  <th className="py-2 pr-3">Donnée</th>
                  <th className="py-2 pr-3">Finalité</th>
                  <th className="py-2">Base légale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marine-50">
                <tr>
                  <td className="py-2 pr-3 font-medium text-marine-900">
                    Email (compte pro)
                  </td>
                  <td className="py-2 pr-3">
                    Authentification, notifications de réservation
                  </td>
                  <td className="py-2 text-marine-600">Contrat</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-marine-900">
                    Email + nom (client final)
                  </td>
                  <td className="py-2 pr-3">
                    Confirmation de la réservation, contact si nécessaire
                  </td>
                  <td className="py-2 text-marine-600">Contrat</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-marine-900">
                    Taille du groupe
                  </td>
                  <td className="py-2 pr-3">
                    Décompte des places restantes affiché côté public
                  </td>
                  <td className="py-2 text-marine-600">Contrat</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-marine-900">
                    Coordonnées du bar
                  </td>
                  <td className="py-2 pr-3">
                    Affichage public, géolocalisation, partage social
                  </td>
                  <td className="py-2 text-marine-600">Contrat</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-marine-900">
                    Adresse IP (logs serveur)
                  </td>
                  <td className="py-2 pr-3">
                    Sécurité, prévention des abus
                  </td>
                  <td className="py-2 text-marine-600">Intérêt légitime</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3">
              Aucune donnée n'est collectée à des fins publicitaires ou de
              profilage. Aucun cookie tiers de tracking n'est posé. Seul
              un cookie d'authentification Supabase est utilisé pour
              maintenir votre session si vous avez un compte pro (sa durée
              est limitée à 1 heure, renouvelable automatiquement tant que
              vous êtes actif).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Sous-traitants et transferts
            </h2>
            <p className="mt-2">
              Nous faisons appel aux sous-traitants suivants :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Supabase, Inc.</strong> — base de données,
                authentification, Storage. Données hébergées sur la
                région UE (Francfort). Voir leur{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-bleu-600 hover:underline"
                >
                  politique de confidentialité
                </a>
                .
              </li>
              <li>
                <strong>Resend, Inc.</strong> — envoi d'emails
                transactionnels (confirmations de réservation, alertes aux
                bars). Voir leur{' '}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-bleu-600 hover:underline"
                >
                  politique
                </a>
                . Transferts encadrés par les clauses contractuelles
                types de la Commission européenne.
              </li>
              <li>
                <strong>OpenStreetMap (Nominatim)</strong> — géocodage des
                adresses saisies par les bars (conversion adresse → lat/lng
                à l'inscription). Pas de transfert de données utilisateur
                final.
              </li>
              <li>
                <strong>Hostinger International Ltd</strong> (Chypre) —
                hébergement du serveur web qui sert l'application front-end.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Durées de conservation
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Compte pro (bar)</strong> : tant que le compte est
                actif, et 12 mois après la dernière connexion. Suppression
                automatique au-delà, sauf demande explicite plus tôt.
              </li>
              <li>
                <strong>Réservations clients</strong> : 12 mois après la
                date du match concerné, à des fins de support et de
                résolution de litiges éventuels. Anonymisation au-delà.
              </li>
              <li>
                <strong>Logs serveur</strong> : 90 jours.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">Vos droits</h2>
            <p className="mt-2">
              Conformément au Règlement Général sur la Protection des
              Données (RGPD) et à la loi Informatique et Libertés, vous
              disposez à tout moment des droits suivants sur vos données
              personnelles :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Droit d'accès et de copie</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
              <li>
                Droit de définir des directives post-mortem (loi Lemaire)
              </li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, écrivez à{' '}
              <a
                href="mailto:contact@matchspot.fr"
                className="font-medium text-bleu-600 hover:underline"
              >
                contact@matchspot.fr
              </a>{' '}
              en précisant l'objet de votre demande. Nous nous engageons à
              répondre dans un délai d'un mois maximum.
            </p>
            <p className="mt-3">
              Si vous estimez que nos pratiques ne respectent pas la
              réglementation, vous avez le droit d'introduire une
              réclamation auprès de la{' '}
              <a
                href="https://www.cnil.fr/fr/plaintes"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-bleu-600 hover:underline"
              >
                CNIL
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-marine-900">
              Mises à jour de cette politique
            </h2>
            <p className="mt-2">
              Cette politique peut être amenée à évoluer. Les changements
              substantiels seront notifiés par email aux comptes pros
              actifs et signalés en haut de cette page pendant 30 jours.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
