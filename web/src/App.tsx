import { Navigate, Route, Routes } from 'react-router-dom';
import { FournisseurSession, useSession } from './contexte/SessionContexte';
import { PageAccueil } from './pages/PageAccueil';
import { PageConnexion } from './pages/PageConnexion';
import { PageInscriptionPro } from './pages/PageInscriptionPro';
import { PageReinitialisation } from './pages/PageReinitialisation';
import { PageTableauDeBord } from './pages/PageTableauDeBord';
import { PageEtablissement } from './pages/PageEtablissement';
import { PagePublique } from './pages/PagePublique';
import { PageMatch } from './pages/PageMatch';
import { PageAdminResultats } from './pages/PageAdminResultats';
import { Page404 } from './pages/Page404';

function RouteProtegee({ children }: { children: JSX.Element }) {
  const { session, chargement } = useSession();
  if (chargement) {
    return <EcranChargement />;
  }
  if (!session) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

function EcranChargement() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      Chargement…
    </div>
  );
}

export function App() {
  return (
    <FournisseurSession>
      <Routes>
        <Route path="/" element={<PageAccueil />} />
        <Route path="/connexion" element={<PageConnexion />} />
        <Route path="/inscription-pro" element={<PageInscriptionPro />} />
        <Route path="/mot-de-passe-oublie" element={<PageReinitialisation />} />
        <Route
          path="/tableau-de-bord"
          element={
            <RouteProtegee>
              <PageTableauDeBord />
            </RouteProtegee>
          }
        />
        <Route
          path="/tableau-de-bord/etablissements/:etablissementId"
          element={
            <RouteProtegee>
              <PageEtablissement />
            </RouteProtegee>
          }
        />
        <Route
          path="/admin/resultats"
          element={
            <RouteProtegee>
              <PageAdminResultats />
            </RouteProtegee>
          }
        />
        <Route path="/etablissements/:slug" element={<PagePublique />} />
        <Route path="/matchs/:slugMatch" element={<PageMatch />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </FournisseurSession>
  );
}
