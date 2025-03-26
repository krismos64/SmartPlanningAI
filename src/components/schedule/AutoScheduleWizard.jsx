import axios from "axios";
import moment from "moment";
import "moment/locale/fr";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

// Composants de l'assistant

// ErrorBoundary pour capturer les erreurs dans les composants
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    console.error("Erreur dans le composant:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#ffdddd",
            color: "#ff0000",
            margin: "20px",
            borderRadius: "5px",
          }}
        >
          <h3>Une erreur est survenue dans ce composant.</h3>
          <p>Veuillez contacter l'administrateur ou réessayer plus tard.</p>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
            <summary>Détails de l'erreur (pour les développeurs)</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styles en ligne pour le modal
const modalStyles = {
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 100000,
  },
  modalContent: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#ffffff",
    width: "90%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    borderRadius: "0.75rem",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.5)",
    overflow: "auto",
  },
  darkModalContent: {
    backgroundColor: "#111827",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  darkModalHeader: {
    borderBottom: "1px solid #374151",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  darkModalTitle: {
    color: "#f3f4f6",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    padding: "0.5rem",
    cursor: "pointer",
    color: "#6b7280",
  },
  darkCloseButton: {
    color: "#9ca3af",
  },
  modalBody: {
    padding: "1.5rem",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1.25rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
  darkModalFooter: {
    borderTop: "1px solid #374151",
  },
  navigationButton: {
    display: "inline-block",
    padding: "0.75rem 1.25rem",
    borderRadius: "0.375rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  backButton: {
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
  },
  darkBackButton: {
    color: "#9ca3af",
    border: "1px solid #4b5563",
  },
  nextButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  progressContainer: {
    padding: "0 1.5rem",
    marginTop: "-0.5rem",
    marginBottom: "1rem",
  },
  progressBar: {
    height: "0.25rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.125rem",
    overflow: "hidden",
  },
  darkProgressBar: {
    backgroundColor: "#374151",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: "0.125rem",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  darkLoadingOverlay: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
  },
};

// Initialiser moment en français
moment.locale("fr");

/**
 * Composant AutoScheduleWizard - Assistant de génération automatique de planning avec IA
 */
const AutoScheduleWizard = ({ isOpen, onClose, onSave, weekStart }) => {
  // États
  const [modalRoot, setModalRoot] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [error, setError] = useState(null);

  // Titres des étapes
  const stepTitles = {
    1: "Sélection des employés",
    2: "Paramètres du planning",
    3: "Préférences des quarts",
    4: "Contraintes spéciales",
    5: "Génération du planning",
  };

  // Initialiser l'élément du portail et charger les données
  useEffect(() => {
    // Créer l'élément du portail
    let portalElement = document.getElementById("modal-root");
    if (!portalElement) {
      portalElement = document.createElement("div");
      portalElement.id = "modal-root";
      document.body.appendChild(portalElement);
    }
    setModalRoot(portalElement);

    // Charger les données des employés si le modal est ouvert
    if (isOpen) {
      fetchEmployees();
    }

    // Nettoyage
    return () => {
      if (isOpen) {
        document.body.style.overflow = "auto";
      }
    };
  }, [isOpen]);

  // Empêcher le défilement quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  // Récupération des employés depuis l'API
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/employees");
      if (response.data && Array.isArray(response.data.data)) {
        setEmployees(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        console.error("Format de réponse inattendu:", response.data);
        setError("Format de données incorrect");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des employés:", err);
      setError("Impossible de charger les employés");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      generateSchedule();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Génération du planning
  const generateSchedule = async () => {
    setIsGenerating(true);
    try {
      // Simuler une réponse pour le moment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Remplacer par un vrai appel API
      // const payload = {
      //   employees: selectedEmployees,
      //   preferences: preferences,
      //   weekStart: weekStart || moment().startOf('week').format('YYYY-MM-DD')
      // };
      // const response = await axios.post("/api/schedule/generate", payload);
      // setGeneratedSchedule(response.data);

      setGeneratedSchedule({
        success: true,
        message: "Planning généré avec succès",
        data: {
          // Simuler des données de planning
          weekStart: weekStart || moment().startOf("week").format("YYYY-MM-DD"),
          shifts: [],
        },
      });

      // Simuler la fin de la génération
      onSave &&
        onSave({
          weekStart: weekStart || moment().startOf("week").format("YYYY-MM-DD"),
          shifts: [],
        });

      // Fermer le modal après génération
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Erreur lors de la génération du planning:", err);
      setError("Impossible de générer le planning");
    } finally {
      setIsGenerating(false);
    }
  };

  // Gestion des formulaires
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 5) {
      nextStep();
    } else {
      generateSchedule();
    }
  };

  // Rendu conditionnel du contenu des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <p style={{ marginBottom: "15px" }}>
              Sélectionnez les employés à inclure dans le planning:
            </p>
            {isLoading ? (
              <p>Chargement des employés...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <div>
                <p>Liste des employés (simulée)</p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {[1, 2, 3, 4, 5].map((id) => (
                    <li
                      key={id}
                      style={{
                        margin: "10px 0",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                      }}
                    >
                      <label style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          style={{ marginRight: "10px" }}
                          onChange={() => {
                            // Gérer la sélection des employés
                          }}
                        />
                        Employé #{id}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <p>Définissez les paramètres généraux du planning:</p>
            <div style={{ marginTop: "15px" }}>
              <label style={{ display: "block", marginBottom: "10px" }}>
                Période du planning:
                <input
                  type="date"
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  defaultValue={moment().format("YYYY-MM-DD")}
                />
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <p>Définissez les préférences pour les quarts de travail:</p>
            <div style={{ marginTop: "15px" }}>
              <label style={{ display: "block", marginBottom: "10px" }}>
                Durée minimale d'un quart:
                <select
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="4">4 heures</option>
                  <option value="6">6 heures</option>
                  <option value="8">8 heures</option>
                </select>
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <p>Ajoutez des contraintes spéciales:</p>
            <div style={{ marginTop: "15px" }}>
              <label style={{ display: "block", marginBottom: "10px" }}>
                Pauses obligatoires:
                <input type="checkbox" style={{ marginLeft: "10px" }} />
              </label>
            </div>
          </div>
        );
      case 5:
        return (
          <div style={{ textAlign: "center" }}>
            <p>Prêt à générer le planning!</p>
            <p style={{ marginTop: "15px" }}>
              L'IA va maintenant générer un planning optimisé en fonction des
              paramètres spécifiés.
            </p>
            {isGenerating && (
              <div style={{ marginTop: "20px" }}>
                <p>Génération en cours...</p>
                {/* Emplacement pour un spinner ou animation de chargement */}
              </div>
            )}
          </div>
        );
      default:
        return <p>Étape inconnue</p>;
    }
  };

  // Calcul du pourcentage de progression
  const progressPercentage = ((currentStep - 1) / 4) * 100;

  // Si le modal n'est pas ouvert ou si le modalRoot n'est pas disponible, ne rien afficher
  if (!isOpen || !modalRoot) return null;

  // Le contenu du modal
  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: 10000000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>
            {stepTitles[currentStep] || "Assistant de planification"}
          </h2>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Barre de progression */}
        <div style={{ padding: "0 20px" }}>
          <div
            style={{
              height: "6px",
              backgroundColor: "#eee",
              borderRadius: "3px",
              overflow: "hidden",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercentage}%`,
                backgroundColor: "#3b82f6",
                borderRadius: "3px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "20px" }}>{renderStepContent()}</div>

          {/* Pied de page avec boutons de navigation */}
          <div
            style={{
              padding: "20px",
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button
              type="button"
              style={{
                padding: "10px 20px",
                backgroundColor: currentStep > 1 ? "#f3f4f6" : "#e5e7eb",
                color: currentStep > 1 ? "#374151" : "#9ca3af",
                border: "1px solid #d1d5db",
                borderRadius: "5px",
                cursor: currentStep > 1 ? "pointer" : "not-allowed",
                opacity: currentStep > 1 ? 1 : 0.5,
              }}
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Précédent
            </button>

            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: isGenerating ? "#9ca3af" : "#3b82f6",
                color: "#ffffff",
                border: "none",
                borderRadius: "5px",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
              }}
              disabled={isGenerating}
            >
              {currentStep < 5 ? "Suivant" : "Générer le planning"}
            </button>
          </div>
        </form>

        {/* Overlay de chargement */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <p>Chargement...</p>
          </div>
        )}
      </div>
    </div>
  );

  // Utiliser createPortal pour rendre le modal dans le modalRoot
  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default AutoScheduleWizard;
