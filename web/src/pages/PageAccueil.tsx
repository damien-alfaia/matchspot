import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { MoteurRecherche } from '../composants/MoteurRecherche';

export function PageAccueil() {
  return (
    <div className="min-h-screen bg-pageAccueil bg-cover bg-[center_65%] bg-no-repeat dark:bg-pageAccueilDark">
      <Entete />
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-10 text-center text-white sm:pb-20 sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-bleu-100">
          Coupe du Monde 2026 · 11 juin → 19 juillet
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Où voir le match,
          <br />
          <span className="text-bleu-300">près de chez vous</span> ?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-marine-100 sm:text-lg">
          MatchSpot trouve les bars et restaurants qui diffusent votre match
          de la Coupe du Monde, et réserve votre table en quelques clics.
        </p>
      </section>

      <main id="contenu-principal" tabIndex={-1} className="relative pb-16">
        <div className="mx-auto max-w-3xl px-4">
          <MoteurRecherche />
        </div>
      </main>

      <Footer />
    </div>
  );
}
