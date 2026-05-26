import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-marine-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-marine-600">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-bold text-marine-900">
              <img
                src="/logo.svg"
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
              />
              Match<span className="text-bleu-500">Spot</span>
            </p>
            <p className="mt-2 text-xs text-marine-500">
              Où voir le match, près de chez vous.
              <br />
              Coupe du Monde 2026.
            </p>
          </div>

          <nav>
            <p className="text-xs font-semibold uppercase tracking-wider text-marine-500">
              À propos
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link to="/a-propos" className="hover:text-bleu-600">
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/comment-ca-marche-bar"
                  className="hover:text-bleu-600"
                >
                  Comment ça marche (pour les bars)
                </Link>
              </li>
              <li>
                <Link to="/inscription-pro" className="hover:text-bleu-600">
                  Inscription pro
                </Link>
              </li>
            </ul>
          </nav>

          <nav>
            <p className="text-xs font-semibold uppercase tracking-wider text-marine-500">
              Légal
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link to="/mentions-legales" className="hover:text-bleu-600">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-bleu-600">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@matchspot.fr"
                  className="hover:text-bleu-600"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-marine-50 pt-4 text-xs text-marine-500">
          © 2026 MatchSpot — fait avec ⚽ et ☕ en France.
        </div>
      </div>
    </footer>
  );
}
