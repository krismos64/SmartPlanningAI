import { useEffect, useState } from "react";
import { fetchCsrfTokenRobust } from "../../utils/api";

/**
 * Panneau de debug pour tester le système CSRF
 * Utilisé uniquement pour le développement, ne pas inclure en production
 */
const CsrfDebugPanel = () => {
  const [csrfResponse, setCsrfResponse] = useState(null);
  const [cookies, setCookies] = useState("");
  const [localStorageToken, setLocalStorageToken] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    xsrfTokenCookie: false,
    connectSidCookie: false,
    localStorageToken: false,
  });

  // Mise à jour des indicateurs de statut
  useEffect(() => {
    updateDebugInfo();
  }, [csrfResponse, cookies]);

  // Fonction pour mettre à jour les indicateurs de statut
  const updateDebugInfo = () => {
    const hasCsrfCookie = document.cookie.includes("XSRF-TOKEN");
    const hasSessionCookie =
      document.cookie.includes("connect.sid") ||
      document.cookie.includes("sid");
    const hasLocalToken = localStorage.getItem("csrf_token") !== null;

    setDebugInfo({
      xsrfTokenCookie: hasCsrfCookie,
      connectSidCookie: hasSessionCookie,
      localStorageToken: hasLocalToken,
    });

    // Mise à jour du token localStorage pour l'affichage
    setLocalStorageToken(localStorage.getItem("csrf_token"));
  };

  // Tester l'endpoint /api/csrf-token
  const testCsrfToken = async () => {
    console.log("🧪 Test de la route /api/csrf-token...");
    try {
      // Utiliser la fonction robuste pour récupérer le token
      const token = await fetchCsrfTokenRobust(3, 1000);

      if (token) {
        setCsrfResponse({
          success: true,
          csrfToken: token,
          message: "Token CSRF récupéré avec succès",
        });
        console.log("💾 Token CSRF récupéré:", token);
      } else {
        setCsrfResponse({
          success: false,
          error: "Impossible de récupérer le token CSRF",
        });
        console.warn("⚠️ Échec de récupération du token CSRF");
      }

      // Mettre à jour les cookies et le statut après un court délai
      setCookies(document.cookie);
      setTimeout(updateDebugInfo, 200);
    } catch (error) {
      console.error("❌ Erreur lors de la requête CSRF:", error);
      setCsrfResponse({ error: error.message });
      updateDebugInfo();
    }
  };

  // Afficher les cookies
  const showCookies = () => {
    console.log("🍪 Cookies actuels:", document.cookie);
    setCookies(document.cookie);
    updateDebugInfo();
  };

  // Format pour JSON
  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  // Style pour le panneau
  const panelStyle = {
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "15px",
    margin: "15px",
    backgroundColor: "#f8f9fa",
    fontFamily: "monospace",
    maxWidth: "800px",
  };

  const headerStyle = {
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px",
    marginBottom: "15px",
    color: "#333",
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "8px 15px",
    margin: "5px",
    cursor: "pointer",
  };

  const sectionStyle = {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const preStyle = {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    borderRadius: "4px",
    overflowX: "auto",
    maxHeight: "200px",
  };

  const statusStyle = (isActive) => ({
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "4px",
    backgroundColor: isActive ? "#d4edda" : "#f8d7da",
    color: isActive ? "#155724" : "#721c24",
    fontWeight: "bold",
  });

  return (
    <div style={panelStyle}>
      <h2 style={headerStyle}>Panneau de Debug CSRF</h2>

      <div>
        <button style={buttonStyle} onClick={testCsrfToken}>
          Test /api/csrf-token
        </button>
        <button style={buttonStyle} onClick={showCookies}>
          Afficher document.cookie
        </button>
      </div>

      <div style={sectionStyle}>
        <h3>Statut du système CSRF</h3>
        <ul>
          <li>
            Cookie XSRF-TOKEN:{" "}
            <span style={statusStyle(debugInfo.xsrfTokenCookie)}>
              {debugInfo.xsrfTokenCookie ? "✅ Présent" : "❌ Absent"}
            </span>
          </li>
          <li>
            Cookie connect.sid:{" "}
            <span style={statusStyle(debugInfo.connectSidCookie)}>
              {debugInfo.connectSidCookie ? "✅ Présent" : "❌ Absent"}
            </span>
          </li>
          <li>
            localStorage["csrf_token"]:{" "}
            <span style={statusStyle(debugInfo.localStorageToken)}>
              {debugInfo.localStorageToken ? "✅ Présent" : "❌ Absent"}
            </span>
          </li>
        </ul>
      </div>

      {csrfResponse && (
        <div style={sectionStyle}>
          <h3>Réponse de /api/csrf-token</h3>
          <pre style={preStyle}>
            <code>{formatJSON(csrfResponse)}</code>
          </pre>
        </div>
      )}

      {cookies && (
        <div style={sectionStyle}>
          <h3>Cookies (document.cookie)</h3>
          <pre style={preStyle}>
            <code>{cookies || "(aucun cookie)"}</code>
          </pre>
        </div>
      )}

      {localStorageToken && (
        <div style={sectionStyle}>
          <h3>localStorage["csrf_token"]</h3>
          <pre style={preStyle}>
            <code>{localStorageToken}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CsrfDebugPanel;
