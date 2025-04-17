import { useEffect, useState } from "react";
import {
  api,
  fetchCsrfTokenRobust,
  getApiUrl,
  getStoredCsrfToken,
} from "../utils/api";

/**
 * Fonction utilitaire pour récupérer la valeur d'un cookie par son nom
 */
function getCookieValue(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

/**
 * Page de débogage pour tester la configuration CSRF
 */
const DebugCsrf = () => {
  const [csrfToken, setCsrfToken] = useState(null);
  const [hasCookie, setHasCookie] = useState(false);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  // Vérifier les tokens et cookies au chargement
  useEffect(() => {
    const storedToken = getStoredCsrfToken();
    if (storedToken) {
      setCsrfToken(storedToken);
    }
    checkCookie();
  }, []);

  // Fonction pour vérifier la présence du cookie XSRF-TOKEN
  const checkCookie = () => {
    const cookieExists = document.cookie.includes("XSRF-TOKEN");
    setHasCookie(cookieExists);
    return cookieExists;
  };

  // Récupérer un nouveau token CSRF
  const handleFetchCsrfToken = async () => {
    setLoading(true);
    try {
      const token = await fetchCsrfTokenRobust();
      setCsrfToken(token);
      checkCookie();
      setResponses({
        ...responses,
        csrfToken: { success: true, token },
      });
    } catch (error) {
      setResponses({
        ...responses,
        csrfToken: { success: false, error: error.message },
      });
    } finally {
      setLoading(false);
    }
  };

  // Tester une requête GET vers /api/test/csrf-check
  const handleTestGet = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/test/csrf-check"), {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log("GET Response:", data);

      setResponses({
        ...responses,
        getTest: { success: true, data },
      });
    } catch (error) {
      console.error("GET Error:", error);
      setResponses({
        ...responses,
        getTest: { success: false, error: error.message },
      });
    } finally {
      setLoading(false);
    }
  };

  // Tester une requête POST vers /api/test/csrf-check
  const handleTestPost = async () => {
    setLoading(true);
    try {
      // Récupérer le token directement depuis le cookie XSRF-TOKEN
      const token = getCookieValue("XSRF-TOKEN");

      // Vérifier si le cookie existe
      if (!token) {
        throw new Error(
          "Cookie XSRF-TOKEN non trouvé! Veuillez d'abord récupérer un token CSRF."
        );
      }

      console.log(
        "Utilisation du token CSRF depuis le cookie:",
        token.substring(0, 8) + "..."
      );

      const response = await fetch(getApiUrl("/api/test/csrf-check"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": token,
        },
        body: JSON.stringify({ test: true, timestamp: Date.now() }),
      });

      const data = await response.json();
      console.log("POST Response:", data);

      setResponses({
        ...responses,
        postTest: {
          success: true,
          data,
          token_source: "cookie", // Indique la source du token
          token_preview: token.substring(0, 8) + "...",
        },
      });
    } catch (error) {
      console.error("POST Error:", error);
      setResponses({
        ...responses,
        postTest: { success: false, error: error.message },
      });
    } finally {
      setLoading(false);
    }
  };

  // Tester une requête POST sans token CSRF
  const handleTestPostNoToken = async () => {
    setLoading(true);
    try {
      console.log("Envoi d'une requête POST sans token CSRF");

      const response = await fetch(getApiUrl("/api/test/csrf-check"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Pas de X-CSRF-Token
        },
        body: JSON.stringify({
          test: true,
          timestamp: Date.now(),
          noToken: true,
        }),
      });

      const data = await response.json();
      console.log("POST Sans Token Response:", data);

      // Considérer comme un succès même en cas d'erreur 403
      // car nous testons volontairement que la sécurité fonctionne
      setResponses({
        ...responses,
        postTestNoToken: {
          success: true,
          test_success: response.status === 403, // Le test est réussi si on obtient une erreur 403
          status: response.status,
          data,
          message:
            response.status === 403
              ? "✅ Sécurité OK : Le serveur a rejeté la requête sans token (403)"
              : "⚠️ Vulnérabilité : Le serveur a accepté la requête sans token CSRF!",
        },
      });
    } catch (error) {
      console.error("POST Sans Token Error:", error);
      setResponses({
        ...responses,
        postTestNoToken: {
          success: false,
          error: error.message,
          message: "Erreur lors du test sans token",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Tester le système CSRF complet
  const handleTestAll = async () => {
    setLoading(true);
    try {
      const result = await api.testCsrf();
      console.log("CSRF Test Result:", result);

      setResponses({
        ...responses,
        fullTest: { success: true, result },
      });
    } catch (error) {
      console.error("Test CSRF Error:", error);
      setResponses({
        ...responses,
        fullTest: { success: false, error: error.message },
      });
    } finally {
      setLoading(false);
    }
  };

  // Exporter les résultats en JSON
  const handleExportResults = () => {
    if (Object.keys(responses).length === 0) return;

    const dataStr = JSON.stringify(responses, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `csrf-test-results-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug CSRF</h1>

      <div className="mb-8 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-2">État actuel</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Token CSRF:</p>
            <p className="font-mono text-sm" id="csrf-token-display">
              {csrfToken ? `${csrfToken.substring(0, 8)}...` : "Non défini"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Cookie XSRF-TOKEN:</p>
            <div
              className={`p-2 rounded font-mono text-sm ${
                hasCookie
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
              id="csrf-cookie-display"
            >
              {hasCookie ? (
                <>
                  ✅ Présent - {getCookieValue("XSRF-TOKEN")?.substring(0, 8)}
                  ...
                </>
              ) : (
                <>❌ Absent</>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          id="btn-fetch-token"
          onClick={handleFetchCsrfToken}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test /api/csrf-token
        </button>

        <button
          id="btn-test-get"
          onClick={handleTestGet}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test GET (sans CSRF)
        </button>

        <button
          id="btn-test-post"
          onClick={handleTestPost}
          disabled={loading || !hasCookie}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test POST (avec CSRF)
        </button>

        <button
          id="btn-test-post-no-token"
          onClick={handleTestPostNoToken}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test POST (sans CSRF)
        </button>

        <button
          id="btn-test-all"
          onClick={handleTestAll}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test complet
        </button>

        {Object.keys(responses).length > 0 && (
          <button
            id="btn-export-results"
            onClick={handleExportResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Exporter résultats JSON
          </button>
        )}
      </div>

      {Object.entries(responses).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Résultats</h2>
          <div className="space-y-4">
            {Object.entries(responses).map(([key, result]) => (
              <div
                key={key}
                className={`p-4 rounded ${
                  result.success
                    ? key === "postTestNoToken" && result.test_success
                      ? "bg-green-100"
                      : key === "postTestNoToken" && !result.test_success
                      ? "bg-orange-100"
                      : "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <h3 className="font-semibold">{key}</h3>
                {key === "postTestNoToken" && result.message && (
                  <p
                    className={`my-2 ${
                      result.test_success ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    {result.message}
                  </p>
                )}
                <pre className="mt-2 bg-gray-800 text-white p-2 rounded overflow-auto max-h-60 text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-60 text-sm">
          {JSON.stringify(
            {
              location: window.location.href,
              userAgent: navigator.userAgent,
              cookies: document.cookie,
              csrfCookie: {
                value: getCookieValue("XSRF-TOKEN"),
                exists: !!getCookieValue("XSRF-TOKEN"),
              },
              localStorage: {
                csrf_token: localStorage.getItem("csrf_token"),
              },
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default DebugCsrf;
