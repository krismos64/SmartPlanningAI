import axios from "axios";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiX,
} from "react-icons/fi";
import Lottie from "react-lottie";
import robotAnimation from "../../animations/robot.json";

// Initialiser moment en français
moment.locale("fr");

// Animations
const fadeIn = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const slideIn = `
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const pulse = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

// Options pour l'animation Lottie
const robotOptions = {
  loop: true,
  autoplay: true,
  animationData: robotAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

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
  const [error, setError] = useState("Impossible de charger les employés");
  const [showError, setShowError] = useState(true);

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

      // Insérer les styles d'animation
      const styleElement = document.createElement("style");
      styleElement.innerHTML = `
        ${fadeIn}
        ${slideIn}
        ${pulse}
        ${shimmer}
      `;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
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
      setShowError(true);
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
      setShowError(true);
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
          <div
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <p
              style={{
                marginBottom: "20px",
                fontSize: "16px",
                color: "#3B82F6",
              }}
            >
              Sélectionnez les employés à inclure dans le planning:
            </p>

            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <div style={{ width: "150px", height: "150px" }}>
                  <Lottie options={robotOptions} />
                </div>
                <p style={{ color: "#64748B", marginTop: "15px" }}>
                  Chargement des employés...
                </p>
              </div>
            ) : showError ? (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderLeft: "4px solid #EF4444",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  animation: "pulse 2s infinite",
                }}
              >
                <FiAlertTriangle
                  style={{
                    color: "#EF4444",
                    fontSize: "24px",
                    marginRight: "12px",
                  }}
                />
                <div>
                  <p
                    style={{
                      color: "#EF4444",
                      fontWeight: "500",
                      fontSize: "16px",
                    }}
                  >
                    {error}
                  </p>
                  <p
                    style={{
                      color: "#64748B",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Veuillez réessayer plus tard ou contacter l'administrateur
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p>Liste des employés (simulée)</p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((id) => (
                    <li
                      key={id}
                      style={{
                        padding: "15px",
                        borderRadius: "10px",
                        background: "linear-gradient(145deg, #f6f8fc, #ffffff)",
                        boxShadow:
                          "5px 5px 10px rgba(163, 177, 198, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.7)",
                        transition: "all 0.3s ease",
                        animation: `slideIn 0.3s ease-out forwards ${
                          id * 0.1
                        }s`,
                        opacity: 0,
                        transform: "translateY(-20px)",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: "2px solid #3B82F6",
                            marginRight: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            backgroundColor: selectedEmployees.includes(id)
                              ? "#3B82F6"
                              : "transparent",
                          }}
                        >
                          {selectedEmployees.includes(id) && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 13L9 17L19 7"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          style={{
                            fontWeight: "500",
                            color: "#1E293B",
                          }}
                        >
                          Employé #{id}
                        </span>
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
          <div
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <p
              style={{
                marginBottom: "20px",
                fontSize: "16px",
                color: "#3B82F6",
              }}
            >
              Définissez les paramètres généraux du planning:
            </p>
            <div
              style={{
                marginTop: "15px",
                display: "grid",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(145deg, #f6f8fc, #ffffff)",
                  boxShadow:
                    "5px 5px 10px rgba(163, 177, 198, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.7)",
                  borderRadius: "10px",
                  padding: "20px",
                  animation: "slideIn 0.3s ease-out forwards",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "500",
                      color: "#1E293B",
                    }}
                  >
                    Période du planning:
                  </span>
                  <input
                    type="date"
                    style={{
                      padding: "12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      outline: "none",
                      transition: "all 0.2s ease",
                      fontSize: "14px",
                      width: "100%",
                      maxWidth: "300px",
                    }}
                    defaultValue={moment().format("YYYY-MM-DD")}
                  />
                </label>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <p
              style={{
                marginBottom: "20px",
                fontSize: "16px",
                color: "#3B82F6",
              }}
            >
              Définissez les préférences pour les quarts de travail:
            </p>
            <div
              style={{
                marginTop: "15px",
                display: "grid",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(145deg, #f6f8fc, #ffffff)",
                  boxShadow:
                    "5px 5px 10px rgba(163, 177, 198, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.7)",
                  borderRadius: "10px",
                  padding: "20px",
                  animation: "slideIn 0.3s ease-out forwards",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "500",
                      color: "#1E293B",
                    }}
                  >
                    Durée minimale d'un quart:
                  </span>
                  <select
                    style={{
                      padding: "12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      outline: "none",
                      transition: "all 0.2s ease",
                      fontSize: "14px",
                      width: "100%",
                      maxWidth: "300px",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                    }}
                  >
                    <option value="4">4 heures</option>
                    <option value="6">6 heures</option>
                    <option value="8">8 heures</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <p
              style={{
                marginBottom: "20px",
                fontSize: "16px",
                color: "#3B82F6",
              }}
            >
              Ajoutez des contraintes spéciales:
            </p>
            <div
              style={{
                marginTop: "15px",
                display: "grid",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(145deg, #f6f8fc, #ffffff)",
                  boxShadow:
                    "5px 5px 10px rgba(163, 177, 198, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.7)",
                  borderRadius: "10px",
                  padding: "20px",
                  animation: "slideIn 0.3s ease-out forwards",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: "2px solid #3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        opacity: 0,
                        position: "absolute",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontWeight: "500",
                      color: "#1E293B",
                    }}
                  >
                    Pauses obligatoires
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                marginBottom: "20px",
              }}
            >
              <Lottie options={robotOptions} />
            </div>

            <p
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#3B82F6",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              Prêt à générer le planning!
            </p>

            <p
              style={{
                color: "#64748B",
                textAlign: "center",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              L'IA va maintenant générer un planning optimisé en fonction des
              paramètres spécifiés.
            </p>

            {isGenerating && (
              <div
                style={{
                  marginTop: "30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "4px",
                    backgroundColor: "#E2E8F0",
                    borderRadius: "2px",
                    overflow: "hidden",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      width: "30%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite linear",
                    }}
                  ></div>
                </div>
                <p
                  style={{
                    color: "#64748B",
                    fontSize: "14px",
                  }}
                >
                  Génération en cours...
                </p>
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
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 10000000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        animation: "fadeIn 0.3s ease-out forwards",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "94%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow:
            "0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          position: "relative",
          animation: "slideIn 0.4s ease-out forwards",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to right, #3B82F6, #60A5FA)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: "600",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {stepTitles[currentStep] || "Assistant de planification"}
          </h2>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "#ffffff",
            }}
            onClick={onClose}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Barre de progression */}
        <div style={{ padding: "0" }}>
          <div
            style={{
              height: "6px",
              backgroundColor: "#E2E8F0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercentage}%`,
                background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
                transition: "width 0.5s ease-in-out",
              }}
            />
          </div>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>{renderStepContent()}</div>

          {/* Pied de page avec boutons de navigation */}
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              background: "#F8FAFC",
            }}
          >
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                backgroundColor: currentStep > 1 ? "#ffffff" : "#F1F5F9",
                color: currentStep > 1 ? "#3B82F6" : "#94A3B8",
                border: `1px solid ${currentStep > 1 ? "#CBD5E1" : "#E2E8F0"}`,
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "14px",
                cursor: currentStep > 1 ? "pointer" : "not-allowed",
                opacity: currentStep > 1 ? 1 : 0.7,
                transition: "all 0.2s ease",
              }}
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <FiArrowLeft size={16} style={{ marginRight: "8px" }} />
              Précédent
            </button>

            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                background: isGenerating
                  ? "#94A3B8"
                  : "linear-gradient(to right, #3B82F6, #60A5FA)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "14px",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                boxShadow: isGenerating
                  ? "none"
                  : "0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.1)",
                transition: "all 0.2s ease",
              }}
              disabled={isGenerating}
            >
              {currentStep < 5 ? (
                <>
                  Suivant
                  <FiArrowRight size={16} style={{ marginLeft: "8px" }} />
                </>
              ) : (
                "Générer le planning"
              )}
            </button>
          </div>
        </form>

        {/* Overlay de chargement */}
        {isLoading && !showError && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <div style={{ width: "150px", height: "150px" }}>
              <Lottie options={robotOptions} />
            </div>
            <p
              style={{ color: "#3B82F6", marginTop: "15px", fontWeight: "500" }}
            >
              Chargement des données...
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Utiliser createPortal pour rendre le modal dans le modalRoot
  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default AutoScheduleWizard;
