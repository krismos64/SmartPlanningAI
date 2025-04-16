import logger from "./logger";

/**
 * Utilitaire de diagnostic pour l'API
 * Permet de tester les connexions et d'identifier les problèmes
 */
class ApiDiagnostic {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
    this.results = {
      healthCheck: null,
      csrfToken: null,
      browserInfo: null,
      networkInfo: null,
      corsTest: null,
      cookiesTest: null,
    };
  }

  /**
   * Exécute tous les diagnostics disponibles
   */
  async runAllDiagnostics() {
    await this.collectBrowserInfo();
    await this.testNetworkConnectivity();
    await this.testHealthCheck();
    await this.testCsrfToken();
    await this.testCorsHeaders();
    await this.testCookies();

    logger.info("Résultats du diagnostic API:", this.results);
    return this.results;
  }

  /**
   * Collecte les informations sur le navigateur
   */
  async collectBrowserInfo() {
    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
        doNotTrack: navigator.doNotTrack,
        platform: navigator.platform,
        vendor: navigator.vendor,
        localStorage: typeof localStorage !== "undefined",
        sessionStorage: typeof sessionStorage !== "undefined",
      };

      this.results.browserInfo = browserInfo;
      logger.debug("Informations navigateur:", browserInfo);
      return browserInfo;
    } catch (error) {
      logger.error(
        "Erreur lors de la collecte des informations du navigateur",
        error
      );
      this.results.browserInfo = { error: error.message };
      return null;
    }
  }

  /**
   * Teste la connectivité réseau de base
   */
  async testNetworkConnectivity() {
    try {
      const networkInfo = {
        online: navigator.onLine,
        apiUrl: this.apiUrl,
      };

      this.results.networkInfo = networkInfo;
      logger.debug("Informations réseau:", networkInfo);
      return networkInfo;
    } catch (error) {
      logger.error("Erreur lors de la collecte des informations réseau", error);
      this.results.networkInfo = { error: error.message };
      return null;
    }
  }

  /**
   * Teste la route de health check de l'API
   */
  async testHealthCheck() {
    try {
      const response = await fetch(`${this.apiUrl}/api/health-check`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      this.results.healthCheck = {
        status: response.status,
        ok: response.ok,
        data,
      };

      logger.debug("Test health check:", this.results.healthCheck);
      return this.results.healthCheck;
    } catch (error) {
      logger.error("Erreur lors du test health check", error);
      this.results.healthCheck = { error: error.message };
      return null;
    }
  }

  /**
   * Teste l'obtention du token CSRF
   */
  async testCsrfToken() {
    try {
      const response = await fetch(`${this.apiUrl}/api/csrf`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      this.results.csrfToken = {
        status: response.status,
        ok: response.ok,
        hasToken: !!data.token,
        data: { ...data, token: data.token ? "******" : null }, // Masquer le token pour la sécurité
      };

      logger.debug("Test CSRF token:", this.results.csrfToken);
      return this.results.csrfToken;
    } catch (error) {
      logger.error("Erreur lors du test CSRF token", error);
      this.results.csrfToken = { error: error.message };
      return null;
    }
  }

  /**
   * Teste les en-têtes CORS
   */
  async testCorsHeaders() {
    try {
      const response = await fetch(`${this.apiUrl}/api/health-check`, {
        method: "OPTIONS",
        headers: {
          Origin: window.location.origin,
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      // Vérifier les en-têtes CORS
      const corsHeaders = {
        "access-control-allow-origin": response.headers.get(
          "access-control-allow-origin"
        ),
        "access-control-allow-methods": response.headers.get(
          "access-control-allow-methods"
        ),
        "access-control-allow-headers": response.headers.get(
          "access-control-allow-headers"
        ),
        "access-control-allow-credentials": response.headers.get(
          "access-control-allow-credentials"
        ),
      };

      this.results.corsTest = {
        status: response.status,
        ok: response.status === 204 || response.ok,
        headers: corsHeaders,
      };

      logger.debug("Test CORS:", this.results.corsTest);
      return this.results.corsTest;
    } catch (error) {
      logger.error("Erreur lors du test CORS", error);
      this.results.corsTest = { error: error.message };
      return null;
    }
  }

  /**
   * Teste la gestion des cookies
   */
  async testCookies() {
    try {
      // Vérifier les cookies existants
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name) acc[name] = value;
        return acc;
      }, {});

      this.results.cookiesTest = {
        cookiesEnabled: navigator.cookieEnabled,
        hasCookies: Object.keys(cookies).length > 0,
        cookies: Object.keys(cookies).map((name) => ({
          name,
          value: name.includes("token")
            ? "******"
            : cookies[name].substring(0, 10) + "...",
        })),
      };

      logger.debug("Test cookies:", this.results.cookiesTest);
      return this.results.cookiesTest;
    } catch (error) {
      logger.error("Erreur lors du test des cookies", error);
      this.results.cookiesTest = { error: error.message };
      return null;
    }
  }

  /**
   * Récupère un rapport complet formaté
   */
  getFormattedReport() {
    return JSON.stringify(this.results, null, 2);
  }
}

// Exporter l'instance et la classe
export const diagnosticTool = new ApiDiagnostic();
export default ApiDiagnostic;
