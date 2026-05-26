import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { FournisseurTheme } from './contexte/ThemeContexte';
import './index.css';

const racine = document.getElementById('racine');
if (!racine) {
  throw new Error("L'élément racine n'a pas été trouvé dans le DOM.");
}

createRoot(racine).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurTheme>
        <App />
      </FournisseurTheme>
    </BrowserRouter>
  </StrictMode>,
);
