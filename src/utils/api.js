const API_BASE_URL = process.env.REACT_APP_API_URL;

export function getApiUrl(path = "") {
  // Si le chemin est déjà une URL complète, la retourner telle quelle
  if (path.startsWith("http")) {
    return path;
  }

  // Liste des endpoints qui ne nécessitent pas le préfixe /api
  const noApiPrefixEndpoints = ["/csrf-token", "/ping"];

  // Si le chemin est vide, retourner l'URL de base
  if (!path) {
    return API_BASE_URL || "http://localhost:5001";
  }

  // Normaliser le chemin pour s'assurer qu'il commence par /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Vérifier si le chemin pointe vers une URL d'API standard
  // 1. Les chemins qui commencent déjà par /api
  // 2. Les chemins qui sont dans la liste des exceptions
  if (
    normalizedPath.startsWith("/api") ||
    noApiPrefixEndpoints.includes(normalizedPath)
  ) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  // Vérifier si le chemin est un endpoint racine comme "vacations" ou "employees"
  // Tous ces endpoints devraient être préfixés par /api
  return `${API_BASE_URL}/api${normalizedPath}`;
}
