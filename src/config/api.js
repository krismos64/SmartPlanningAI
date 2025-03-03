import { toast } from "react-toastify";

// Configuration de l'API
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001";

// Routes de l'API
export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  EMPLOYEES: `${API_BASE_URL}/api/employees`,
  PLANNING: `${API_BASE_URL}/api/planning`,
  VACATIONS: `${API_BASE_URL}/api/vacations`,
  STATS: `${API_BASE_URL}/api/stats`,
  SHIFTS: `${API_BASE_URL}/api/shifts`,
};

// Fonction générique pour les requêtes API
export const apiRequest = async (
  url,
  method = "GET",
  data = null,
  customHeaders = {}
) => {
  try {
    console.log(`🔍 Requête API: ${method} ${url}`);

    // Récupérer le token d'authentification
    const token = localStorage.getItem("token");
    console.log(`🔑 Token utilisé: ${token ? "Présent" : "Absent"}`);

    // Vérifier si un token est nécessaire (sauf pour login et register)
    if (
      !token &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register")
    ) {
      console.warn("⚠️ Tentative d'accès à une route protégée sans token");

      // Rediriger vers la page de connexion
      window.location.href = "/login";
      return { error: "Authentification requise" };
    }

    // Préparer les headers
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Ajouter le token d'authentification si disponible
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Configurer la requête
    const config = {
      method,
      headers,
      credentials: "include",
    };

    // Ajouter le corps de la requête si nécessaire
    if (data) {
      config.body = JSON.stringify(data);
    }

    // Ajouter un timeout pour éviter les requêtes bloquées
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes
    config.signal = controller.signal;

    console.log(`📤 Envoi de la requête: ${method} ${url}`);

    // Effectuer la requête
    const response = await fetch(url, config);

    // Annuler le timeout
    clearTimeout(timeoutId);

    console.log(`📥 Réponse reçue: ${response.status} ${response.statusText}`);

    // Vérifier si la réponse est au format JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();

      // Gérer les erreurs d'authentification
      if (response.status === 401) {
        console.error("🔒 Erreur d'authentification:", responseData);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return { error: responseData.message || "Erreur d'authentification" };
      }

      // Gérer les erreurs serveur
      if (response.status >= 500) {
        console.error("🔥 Erreur serveur:", responseData);
        toast.error("Erreur serveur. Veuillez réessayer plus tard.");
        return { error: responseData.message || "Erreur serveur" };
      }

      // Gérer les autres erreurs
      if (!response.ok) {
        console.error("❌ Erreur API:", responseData);
        return { error: responseData.message || "Une erreur est survenue" };
      }

      console.log("✅ Requête réussie");
      return responseData;
    } else {
      // Gérer les réponses non-JSON
      console.warn("⚠️ Réponse non-JSON reçue");
      const text = await response.text();
      console.log("📄 Contenu de la réponse:", text);

      if (!response.ok) {
        return { error: "Erreur de communication avec le serveur" };
      }

      return { message: text };
    }
  } catch (error) {
    // Gérer les erreurs de timeout
    if (error.name === "AbortError") {
      console.error("⏱️ Timeout de la requête:", error);
      toast.error("La requête a pris trop de temps. Veuillez réessayer.");
      return { error: "Timeout de la requête" };
    }

    // Gérer les erreurs réseau
    console.error("🌐 Erreur réseau:", error);
    toast.error(
      "Erreur de connexion au serveur. Veuillez vérifier votre connexion internet."
    );
    return { error: "Erreur de connexion au serveur" };
  }
};
