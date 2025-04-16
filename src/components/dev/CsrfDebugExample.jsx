import CsrfDebugPanel from "./CsrfDebugPanel";

/**
 * Exemple d'utilisation de CsrfDebugPanel
 * Pour utiliser ce composant, vous pouvez l'importer temporairement
 * dans une page ou un composant existant
 */
const CsrfDebugExample = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Diagnostic CSRF</h1>
      <p>
        Cet outil de diagnostic permet de vérifier le bon fonctionnement du
        système CSRF dans votre application.
      </p>

      <div
        style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <strong>⚠️ Attention :</strong> Composant réservé à l'environnement de
        développement. Ne pas inclure en production !
      </div>

      {/* Composant de debug CSRF */}
      <CsrfDebugPanel />

      <div style={{ marginTop: "20px" }}>
        <h3>Comment utiliser ce composant ?</h3>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <code>{`
// Importer le composant
import CsrfDebugPanel from './components/dev/CsrfDebugPanel';

// Ajouter dans votre composant (uniquement en dev)
{process.env.NODE_ENV === 'development' && <CsrfDebugPanel />}
          `}</code>
        </pre>
      </div>
    </div>
  );
};

export default CsrfDebugExample;
