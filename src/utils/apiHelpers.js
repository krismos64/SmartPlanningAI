/**
 * Importe l'URL de base de l'API depuis la configuration
 */
import { API_URL } from "../config/api";

/**
 * Construit une URL d'API complète en évitant les doubles slash
 * @param {string} path - Le chemin relatif d'API (avec ou sans /api au début)
 * @returns {string} L'URL complète de l'API
 */
export const buildApiUrl = (path) => {
  if (!API_URL) {
    console.error("API_URL n'est pas défini");
    return "";
  }

  // Si le chemin est vide ou /, retourner l'URL de base
  if (!path || path === "/") {
    console.warn("⚠️ Appel détecté avec un chemin vide ou '/' !");
    console.trace(); // affiche la pile d'appels pour localiser l'origine
    return API_URL;
  }

  // Si l'URL de base contient déjà /api, on retire /api/ du chemin
  const cleanPath = API_URL.includes("/api")
    ? path.replace(/^\/api/, "")
    : path;

  // Construire l'URL complète
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return `${baseUrl}${finalPath}`;
};
