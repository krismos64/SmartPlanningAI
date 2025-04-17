import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n"; // Importation des configurations i18n
import "./index.css";
import { initializeErrorHandling } from "./utils/errorHandling";

// Nettoyer les tokens expirés au démarrage
// cleanExpiredTokens(); // Désactivé pour éviter l'authentification automatique

// Initialiser le système de gestion d'erreurs
initializeErrorHandling();

// Composant de chargement pendant que les traductions sont récupérées
const Loader = () => (
  <div className="app-loader">
    <div className="loader-content">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Suspense fallback={<Loader />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
