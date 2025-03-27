import axios from "axios";
import moment from "moment";
import "moment/locale/fr";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiFilter,
  FiX,
} from "react-icons/fi";
import Lottie from "react-lottie";
import robotAnimation from "../../animations/robot.json";
import { API_ENDPOINTS, API_URL } from "../../config/api";

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
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [preferences, setPreferences] = useState({
    minShiftDuration: "3", // Valeur par défaut: 3 heures
    minRestDays: 2, // Nombre minimum de jours de repos par semaine (par défaut: 2)
    preferredRestDays: [], // Jours de repos préférés
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [employeeRestPreferences, setEmployeeRestPreferences] = useState({});

  // Titres des étapes
  const stepTitles = {
    1: "Sélection des employés",
    2: "Paramètres du planning",
    3: "Durée minimale de travail",
    4: "Contraintes spéciales",
    5: "Génération du planning",
  };

  // Récupération des départements depuis l'API
  const fetchDepartments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}${API_ENDPOINTS.DEPARTMENTS.BASE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setDepartments(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        // Définir des départements par défaut en cas d'erreur
        setDepartments([
          { id: "Administration", name: "Administration" },
          { id: "Commercial", name: "Commercial" },
          { id: "Technique", name: "Technique" },
          { id: "Caisses", name: "Caisses" },
          { id: "Boutique", name: "Boutique" },
          { id: "Informatique", name: "Informatique" },
          { id: "Direction", name: "Direction" },
        ]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des départements:", err);
      // Départements par défaut
      setDepartments([
        { id: "Administration", name: "Administration" },
        { id: "Commercial", name: "Commercial" },
        { id: "Technique", name: "Technique" },
        { id: "Caisses", name: "Caisses" },
        { id: "Boutique", name: "Boutique" },
        { id: "Informatique", name: "Informatique" },
        { id: "Direction", name: "Direction" },
      ]);
    }
  }, []);

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

    // Calculer le lundi prochain comme date de début par défaut
    const today = moment();
    const nextMonday = moment().startOf("week").add(1, "weeks");
    const nextSunday = moment(nextMonday).add(6, "days");

    setStartDate(nextMonday.format("YYYY-MM-DD"));
    setEndDate(nextSunday.format("YYYY-MM-DD"));

    // Nettoyage
    return () => {
      if (isOpen) {
        document.body.style.overflow = "auto";
      }
    };
  }, [isOpen]);

  // Effet pour charger les départements et les employés à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
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
  }, [isOpen, fetchDepartments]);

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
    setShowError(false);
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}${API_ENDPOINTS.EMPLOYEES.BASE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setEmployees(response.data.data);
        setFilteredEmployees(response.data.data);

        // Extraire les rôles uniques des employés pour les utiliser comme départements
        extractRolesFromEmployees(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);

        // Extraire les rôles uniques des employés pour les utiliser comme départements
        extractRolesFromEmployees(response.data);
      } else {
        throw new Error("Format de données incorrect");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des employés:", err);
      if (err.response?.status === 401) {
        setError("Session expirée, veuillez vous reconnecter");
      } else {
        setError("Impossible de charger les employés");
      }
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Extraire les rôles uniques des employés pour les utiliser comme départements
  const extractRolesFromEmployees = useCallback((employeesList) => {
    if (
      !employeesList ||
      !Array.isArray(employeesList) ||
      employeesList.length === 0
    )
      return;

    // Extraire tous les rôles uniques
    const uniqueRoles = [
      ...new Set(employeesList.map((emp) => emp.role).filter(Boolean)),
    ];

    // Si des rôles ont été trouvés, les utiliser comme départements
    if (uniqueRoles.length > 0) {
      const roleDepartments = uniqueRoles.map((role) => ({
        id: role,
        name: role,
      }));

      console.log("Départements extraits des rôles:", roleDepartments);
      setDepartments(roleDepartments);
    }
  }, []);

  // Filtrer les employés par département
  const filterEmployeesByDepartment = useCallback(
    (departmentId) => {
      setSelectedDepartment(departmentId);

      // Tracer les données pour debug
      console.log("Filtrage par département:", departmentId);
      console.log("Structure des employés:", employees);

      if (!departmentId) {
        // Si aucun département n'est sélectionné, afficher tous les employés
        setFilteredEmployees(employees);
      } else {
        // Filtrer les employés par département avec plus de conditions
        // en prenant en compte le champ "role" qui est utilisé comme département
        const filtered = employees.filter((employee) => {
          // Vérifier toutes les possibilités de stockage du département
          if (employee.department_id === departmentId) return true;
          if (employee.department === departmentId) return true;
          if (employee.role === departmentId) return true;
          if (employee.department && employee.department.id === departmentId)
            return true;
          if (employee.department && employee.department.value === departmentId)
            return true;
          if (employee.department && employee.department.name === departmentId)
            return true;
          if (employee.departmentId === departmentId) return true;

          // Pour les cas où le département est juste une chaîne
          const deptObj = departments.find(
            (d) => d.id === departmentId || d.value === departmentId
          );
          if (
            deptObj &&
            (employee.department === deptObj.name ||
              employee.role === deptObj.name)
          )
            return true;

          return false;
        });

        console.log("Employés filtrés:", filtered);
        setFilteredEmployees(filtered);
      }
    },
    [employees, departments]
  );

  // Ajoutons également une fonctionnalité pour afficher des employés factices
  // si aucun employé n'est trouvé dans l'API
  useEffect(() => {
    if (employees.length === 0 && !isLoading && !showError) {
      console.log("Aucun employé trouvé, création d'employés simulés");
      // Créer des employés simulés avec le champ role au lieu de department
      const mockEmployees = [
        { id: 1, first_name: "Jean", last_name: "Dupont", role: "Commercial" },
        { id: 2, first_name: "Marie", last_name: "Martin", role: "Technique" },
        {
          id: 3,
          first_name: "Pierre",
          last_name: "Lefebvre",
          role: "Administration",
        },
        {
          id: 4,
          first_name: "Sophie",
          last_name: "Bernard",
          role: "Commercial",
        },
        {
          id: 5,
          first_name: "Lucas",
          last_name: "Petit",
          role: "Informatique",
        },
        { id: 6, first_name: "Emma", last_name: "Dubois", role: "Boutique" },
        { id: 7, first_name: "Thomas", last_name: "Moreau", role: "Direction" },
        {
          id: 8,
          first_name: "Camille",
          last_name: "Girard",
          role: "Technique",
        },
        { id: 9, first_name: "Hugo", last_name: "Fournier", role: "Caisses" },
        {
          id: 10,
          first_name: "Léa",
          last_name: "Mercier",
          role: "Administration",
        },
      ];
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
    }
  }, [employees, isLoading, showError]);

  // Gestion du changement de département
  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    filterEmployeesByDepartment(departmentId);
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

      // Afficher les contraintes dans la console pour debug
      console.log("Paramètres de génération:", {
        selectedEmployees,
        preferences,
        employeeRestPreferences,
        startDate,
        endDate,
      });

      // S'assurer que les dates sont au format YYYY-MM-DD
      const formattedStartDate =
        startDate ||
        moment().startOf("week").add(1, "weeks").format("YYYY-MM-DD");
      const formattedEndDate =
        endDate ||
        moment()
          .startOf("week")
          .add(1, "weeks")
          .add(6, "days")
          .format("YYYY-MM-DD");

      // Remplacer par un vrai appel API
      const payload = {
        employees: selectedEmployees,
        preferences: preferences,
        employeeRestPreferences: employeeRestPreferences,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };
      console.log("Payload de génération:", payload);
      // const response = await axios.post("/api/schedule/generate", payload);
      // setGeneratedSchedule(response.data);

      setGeneratedSchedule({
        success: true,
        message: "Planning généré avec succès",
        data: {
          // Simuler des données de planning
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          shifts: [],
        },
      });

      // Simuler la fin de la génération
      onSave &&
        onSave({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          shifts: [],
          employees: selectedEmployees,
          employeeRestPreferences: employeeRestPreferences,
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

  // Fonctions de gestion des dates
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Mettre à jour automatiquement la date de fin pour qu'elle soit 6 jours après la date de début
    if (newStartDate) {
      const newEndMoment = moment(newStartDate).add(6, "days");
      setEndDate(newEndMoment.format("YYYY-MM-DD"));
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Gestion des préférences
  const handlePreferenceChange = (key, value) => {
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  // Gestion des jours de repos préférés
  const handleRestDayToggle = (day) => {
    const currentPreferredDays = [...preferences.preferredRestDays];
    if (currentPreferredDays.includes(day)) {
      // Retirer le jour s'il est déjà sélectionné
      const updatedDays = currentPreferredDays.filter((d) => d !== day);
      handlePreferenceChange("preferredRestDays", updatedDays);
    } else {
      // Ajouter le jour s'il n'est pas déjà sélectionné
      handlePreferenceChange("preferredRestDays", [
        ...currentPreferredDays,
        day,
      ]);
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
                marginBottom: "1.5rem",
                fontSize: "1rem",
                color: "var(--text-primary)",
              }}
            >
              Sélectionnez les employés à inclure dans le planning:
            </p>

            <div
              style={{
                marginBottom: "1.5rem",
                backgroundColor: "#f6f8fc",
                borderRadius: "8px",
                padding: "0.8rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#4b5563",
                }}
              >
                <FiFilter
                  style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
                />
                Filtrer par département
              </label>
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  backgroundColor: "#ffffff",
                  color: "#1f2937",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <option value="">Tous les départements</option>
                {departments.map((dept) => (
                  <option
                    key={dept.id || dept.value}
                    value={dept.id || dept.value}
                  >
                    {dept.name || dept.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    gridColumn: "1 / -1",
                  }}
                >
                  <Lottie
                    options={robotOptions}
                    height={100}
                    width={100}
                    style={{ margin: "0 auto" }}
                  />
                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Chargement des employés...
                  </p>
                </div>
              ) : showError ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#f44336",
                    gridColumn: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    animation: "pulse 2s infinite",
                  }}
                >
                  <FiAlertTriangle size={40} />
                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "1rem",
                    }}
                  >
                    {error}
                  </p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    gridColumn: "1 / -1",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Aucun employé trouvé dans ce département.
                  </p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    style={{
                      padding: "15px",
                      borderRadius: "10px",
                      background: "linear-gradient(145deg, #f6f8fc, #ffffff)",
                      boxShadow:
                        "5px 5px 10px rgba(163, 177, 198, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.7)",
                      transition: "all 0.3s ease",
                      animation: `slideIn 0.3s ease-out forwards`,
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
                          backgroundColor: selectedEmployees.includes(
                            employee.id
                          )
                            ? "#3B82F6"
                            : "transparent",
                        }}
                      >
                        {selectedEmployees.includes(employee.id) && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="#ffffff"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([
                              ...selectedEmployees,
                              employee.id,
                            ]);

                            // Initialiser les préférences de jours de repos pour cet employé
                            if (!employeeRestPreferences[employee.id]) {
                              setEmployeeRestPreferences((prev) => ({
                                ...prev,
                                [employee.id]: [],
                              }));
                            }
                          } else {
                            setSelectedEmployees(
                              selectedEmployees.filter(
                                (id) => id !== employee.id
                              )
                            );
                          }
                        }}
                        style={{ display: "none" }}
                      />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: "500",
                            color: "var(--text-primary)",
                            display: "block",
                          }}
                        >
                          {employee.first_name} {employee.last_name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748B",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          {/* Afficher les heures contractuelles */}
                          <strong>Heures: </strong>
                          {employee.contractHours ||
                            employee.contract_hours ||
                            35}
                          h
                        </span>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
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
                      Date de début (lundi):
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
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
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                      }}
                    >
                      {startDate &&
                        `${moment(startDate).format("dddd D MMMM YYYY")}`}
                    </span>
                  </label>

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
                      Date de fin (dimanche):
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
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
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                      }}
                    >
                      {endDate &&
                        `${moment(endDate).format("dddd D MMMM YYYY")}`}
                    </span>
                  </label>

                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px 15px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderLeft: "3px solid #3B82F6",
                      borderRadius: "4px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#3B82F6",
                        margin: 0,
                      }}
                    >
                      La période sélectionnée couvre{" "}
                      {startDate &&
                        endDate &&
                        moment(endDate).diff(moment(startDate), "days") +
                          1}{" "}
                      jours, du{" "}
                      {startDate && moment(startDate).format("DD/MM/YYYY")} au{" "}
                      {endDate && moment(endDate).format("DD/MM/YYYY")}.
                    </p>
                  </div>
                </div>
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
              Définissez la durée minimale de travail sur une journée:
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
                    Durée minimale d'un quart de travail:
                  </span>
                  <select
                    value={preferences.minShiftDuration}
                    onChange={(e) =>
                      handlePreferenceChange("minShiftDuration", e.target.value)
                    }
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
                    <option value="3">3 heures</option>
                    <option value="4">4 heures</option>
                    <option value="6">6 heures</option>
                    <option value="8">8 heures</option>
                  </select>
                </label>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderLeft: "3px solid #3B82F6",
                    borderRadius: "4px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#3B82F6",
                      margin: 0,
                    }}
                  >
                    Cette valeur détermine la durée minimale qu'un employé peut
                    travailler sur une journée. Les quarts de travail ne
                    pourront pas être plus courts que cette valeur.
                  </p>
                </div>
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
                <div style={{ marginBottom: "25px" }}>
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
                      Nombre minimum de jours de repos par semaine:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={preferences.minRestDays}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value >= 1 && value <= 7) {
                          handlePreferenceChange("minRestDays", value);
                        }
                      }}
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
                    />
                    {preferences.minRestDays < 1 && (
                      <span
                        style={{
                          color: "#EF4444",
                          fontSize: "13px",
                          marginTop: "5px",
                        }}
                      >
                        Le nombre minimum de jours de repos doit être d'au moins
                        1.
                      </span>
                    )}
                  </label>
                </div>

                {/* Section pour les jours de repos préférés par employé */}
                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      fontWeight: "600",
                      color: "#1E293B",
                      marginBottom: "20px",
                      fontSize: "16px",
                      textAlign: "center",
                      backgroundColor: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <span
                      style={{
                        color: "#3B82F6",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      SÉLECTION DES JOURS DE REPOS
                    </span>
                    Pour chaque employé, sélectionnez les jours où ils ne
                    travaillent pas
                  </p>

                  {selectedEmployees.length === 0 ? (
                    <p style={{ color: "#64748B", fontSize: "14px" }}>
                      Aucun employé sélectionné. Veuillez d'abord sélectionner
                      des employés à l'étape 1.
                    </p>
                  ) : (
                    selectedEmployees.map((employeeId) => {
                      const employee = employees.find(
                        (e) => e.id === employeeId
                      );

                      if (!employee) return null;

                      return (
                        <div
                          key={employeeId}
                          style={{
                            marginBottom: "25px",
                            padding: "20px",
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                            transition: "all 0.3s ease",
                            animation: "fadeIn 0.5s ease-out forwards",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: "600",
                              marginBottom: "10px",
                              fontSize: "16px",
                              color: "#3B82F6",
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "#f0f5ff",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #c7d9ff",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ marginRight: "8px" }}
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {employee.first_name} {employee.last_name}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "10px",
                            }}
                          >
                            {[
                              "Lundi",
                              "Mardi",
                              "Mercredi",
                              "Jeudi",
                              "Vendredi",
                              "Samedi",
                              "Dimanche",
                            ].map((day) => {
                              const isSelected =
                                employeeRestPreferences[employeeId]?.includes(
                                  day
                                );

                              return (
                                <div
                                  key={`${employeeId}-${day}`}
                                  onClick={() => {
                                    // Gérer la sélection/désélection des jours de repos pour cet employé
                                    const currentDays =
                                      employeeRestPreferences[employeeId] || [];
                                    let updatedDays;

                                    if (currentDays.includes(day)) {
                                      updatedDays = currentDays.filter(
                                        (d) => d !== day
                                      );
                                    } else {
                                      updatedDays = [...currentDays, day];
                                    }

                                    setEmployeeRestPreferences({
                                      ...employeeRestPreferences,
                                      [employeeId]: updatedDays,
                                    });
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    backgroundColor: isSelected
                                      ? "rgba(59, 130, 246, 0.2)"
                                      : "rgba(226, 232, 240, 0.7)",
                                    border: `1px solid ${
                                      isSelected ? "#3B82F6" : "#E2E8F0"
                                    }`,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: isSelected
                                      ? "0 2px 4px rgba(59, 130, 246, 0.25)"
                                      : "none",
                                    transform: isSelected
                                      ? "translateY(-1px)"
                                      : "none",
                                    minWidth: "75px",
                                    justifyContent: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      border: `2px solid ${
                                        isSelected ? "#3B82F6" : "#94A3B8"
                                      }`,
                                      marginRight: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "all 0.2s ease",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {isSelected && (
                                      <div
                                        style={{
                                          width: "8px",
                                          height: "8px",
                                          borderRadius: "50%",
                                          backgroundColor: "#3B82F6",
                                        }}
                                      ></div>
                                    )}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: isSelected ? "600" : "400",
                                      color: isSelected ? "#3B82F6" : "#64748B",
                                    }}
                                  >
                                    {day}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderLeft: "3px solid #3B82F6",
                    borderRadius: "4px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#3B82F6",
                      margin: "0 0 10px 0",
                    }}
                  >
                    Ces contraintes seront prises en compte lors de la
                    génération automatique du planning.
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#3B82F6",
                      margin: 0,
                    }}
                  >
                    Le système tentera de respecter au mieux ces préférences,
                    mais elles ne sont pas garanties.
                  </p>
                </div>
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
