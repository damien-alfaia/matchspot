import { Navigate, Route, Routes } from 'react-router-dom';
import { FournisseurSession, useSession } from './contexte/SessionContexte';
import { PageAccueil } from './pages/PageAccueil';
import { PageConnexion } from './pages/PageConnexion';
import { PageTableauDeBord } from './pages/PageTableauDeBord';
import { PageEtablissement } from './pages/PageEtablissement';
import { PagePublique } from './pages/PagePublique';

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
        <Route path="/etablissements/:slug" element={<PagePublique />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FournisseurSession>
  );
}
