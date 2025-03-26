import moment from "moment";
import "moment/locale/fr";
import { useState } from "react";
import { Controller } from "react-hook-form";

// Traduction des préférences
const preferenceTranslations = {
  respectAvailability: "Respect des disponibilités",
  minimizeOvertime: "Minimiser les heures supplémentaires",
  balanceWeekends: "Équilibrer les weekends",
  balanceWorkload: "Équilibrer la charge de travail",
  optimizeBreaks: "Optimiser les pauses",
  balanceRoles: "Équilibrer les rôles",
};

// Traduction des départements
const departmentTranslations = {
  all: "Tous les départements",
  1: "Service client",
  2: "Logistique",
  3: "Administration",
};

const StepFour = ({
  control,
  errors,
  formValues,
  isGenerating,
  onGenerate,
}) => {
  // Styles en ligne
  const styles = {
    container: {
      width: "100%",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "2rem",
    },
    headerMd: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "2rem",
    },
    headerContent: {
      width: "100%",
      marginBottom: "1.5rem",
    },
    headerContentMd: {
      width: "50%",
      marginBottom: 0,
      paddingRight: "1rem",
    },
    iconContainer: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
    },
    iconContainerMd: {
      width: "50%",
      display: "flex",
      justifyContent: "center",
    },
    iconWrapper: {
      width: "12rem",
      height: "12rem",
    },
    icon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      backgroundColor: "#fef3c7",
      borderRadius: "0.5rem",
      padding: "1rem",
    },
    darkIcon: {
      backgroundColor: "#78350f",
    },
    iconSvg: {
      width: "6rem",
      height: "6rem",
      color: "#f59e0b",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "1rem",
    },
    darkTitle: {
      color: "#f3f4f6",
    },
    description: {
      color: "#4b5563",
      marginBottom: "1rem",
    },
    darkDescription: {
      color: "#d1d5db",
    },
    formCard: {
      backgroundColor: "#ffffff",
      borderRadius: "0.75rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
    },
    darkFormCard: {
      backgroundColor: "#1f2937",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
    },
    summarySection: {
      marginBottom: "2rem",
    },
    summaryTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "1rem",
    },
    darkSummaryTitle: {
      color: "#f3f4f6",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
    },
    summaryItem: {
      padding: "1rem",
      backgroundColor: "#f9fafb",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
    },
    darkSummaryItem: {
      backgroundColor: "#111827",
      border: "1px solid #374151",
    },
    itemLabel: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#6b7280",
      marginBottom: "0.5rem",
    },
    darkItemLabel: {
      color: "#9ca3af",
    },
    itemValue: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#1f2937",
    },
    darkItemValue: {
      color: "#f3f4f6",
    },
    preferenceList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginTop: "0.5rem",
    },
    preferenceBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "500",
      backgroundColor: "#f0fdf4",
      color: "#16a34a",
    },
    darkPreferenceBadge: {
      backgroundColor: "#064e3b",
      color: "#a7f3d0",
    },
    saveAsDraftSection: {
      marginBottom: "2rem",
    },
    checkbox: {
      opacity: 0,
      position: "absolute",
      width: 0,
      height: 0,
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    customCheckbox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1.5rem",
      height: "1.5rem",
      borderRadius: "0.25rem",
      border: "2px solid #d1d5db",
      backgroundColor: "#ffffff",
      marginRight: "0.75rem",
      transition: "all 0.2s ease",
    },
    darkCustomCheckbox: {
      border: "2px solid #4b5563",
      backgroundColor: "#1f2937",
    },
    checkedCustomCheckbox: {
      backgroundColor: "#f59e0b",
      borderColor: "#f59e0b",
    },
    checkboxLabelText: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#1f2937",
    },
    darkCheckboxLabelText: {
      color: "#f3f4f6",
    },
    generateSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      marginTop: "2rem",
    },
    robotIconContainer: {
      width: "8rem",
      height: "8rem",
      marginBottom: "1rem",
    },
    generateButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.375rem",
      fontWeight: "500",
      backgroundColor: "#f59e0b",
      color: "#ffffff",
      transition: "all 0.2s ease",
      cursor: "pointer",
      border: "none",
      marginTop: "1rem",
    },
    generateButtonHover: {
      backgroundColor: "#d97706",
    },
    loadingIcon: {
      display: "inline-block",
      width: "1rem",
      height: "1rem",
      marginRight: "0.5rem",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      borderTopColor: "#ffffff",
      animation: "spin 0.8s linear infinite",
    },
    infoText: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginTop: "1rem",
      maxWidth: "24rem",
    },
    darkInfoText: {
      color: "#9ca3af",
    },
    "@keyframes spin": {
      to: { transform: "rotate(360deg)" },
    },
  };

  // Détection du thème sombre
  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Jours de la semaine pour affichage
  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const DAYS_FR = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  // Récupérer les jours d'activité
  const getActiveDays = () => {
    const activeDays = [];
    if (formValues?.businessDays) {
      DAYS.forEach((day, index) => {
        if (formValues.businessDays[day]?.active) {
          activeDays.push(DAYS_FR[index]);
        }
      });
    }
    return activeDays.length > 0 ? activeDays : ["Aucun jour activé"];
  };

  // Récupérer les préférences activées
  const getActivePreferences = () => {
    const activePrefs = [];
    if (formValues?.preferences) {
      for (const [key, value] of Object.entries(formValues.preferences)) {
        if (value && preferenceTranslations[key]) {
          activePrefs.push(preferenceTranslations[key]);
        }
      }
    }
    return activePrefs.length > 0 ? activePrefs : ["Aucune préférence activée"];
  };

  // Formater la date de début de semaine
  const formatWeekStartDate = () => {
    if (!formValues?.weekStartDate) return "Non spécifié";
    moment.locale("fr");
    return moment(formValues.weekStartDate).format("DD MMMM YYYY");
  };

  // Récupérer le nom du département
  const getDepartmentName = () => {
    if (!formValues?.departmentId) return "Non spécifié";
    return (
      departmentTranslations[formValues.departmentId] ||
      `Département ${formValues.departmentId}`
    );
  };

  // État du bouton
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.container}>
      {/* En-tête et illustrations */}
      <div style={window.innerWidth >= 768 ? styles.headerMd : styles.header}>
        <div
          style={
            window.innerWidth >= 768
              ? styles.headerContentMd
              : styles.headerContent
          }
        >
          <h2
            style={{ ...styles.title, ...(isDarkMode ? styles.darkTitle : {}) }}
          >
            Vérifiez vos paramètres
          </h2>
          <p
            style={{
              ...styles.description,
              ...(isDarkMode ? styles.darkDescription : {}),
            }}
          >
            Vérifiez les paramètres de planification avant de lancer la
            génération automatique du planning.
          </p>
        </div>
        <div
          style={
            window.innerWidth >= 768
              ? styles.iconContainerMd
              : styles.iconContainer
          }
        >
          <div style={styles.iconWrapper}>
            <div
              style={{ ...styles.icon, ...(isDarkMode ? styles.darkIcon : {}) }}
            >
              <svg
                style={styles.iconSvg}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Récapitulatif et formulaire */}
      <div
        style={{
          ...styles.formCard,
          ...(isDarkMode ? styles.darkFormCard : {}),
        }}
      >
        {/* Section de résumé */}
        <div style={styles.summarySection}>
          <h3
            style={{
              ...styles.summaryTitle,
              ...(isDarkMode ? styles.darkSummaryTitle : {}),
            }}
          >
            Résumé des paramètres
          </h3>
          <div style={styles.summaryGrid}>
            <div
              style={{
                ...styles.summaryItem,
                ...(isDarkMode ? styles.darkSummaryItem : {}),
              }}
            >
              <div
                style={{
                  ...styles.itemLabel,
                  ...(isDarkMode ? styles.darkItemLabel : {}),
                }}
              >
                Semaine commençant le
              </div>
              <div
                style={{
                  ...styles.itemValue,
                  ...(isDarkMode ? styles.darkItemValue : {}),
                }}
              >
                {formatWeekStartDate()}
              </div>
            </div>

            <div
              style={{
                ...styles.summaryItem,
                ...(isDarkMode ? styles.darkSummaryItem : {}),
              }}
            >
              <div
                style={{
                  ...styles.itemLabel,
                  ...(isDarkMode ? styles.darkItemLabel : {}),
                }}
              >
                Département
              </div>
              <div
                style={{
                  ...styles.itemValue,
                  ...(isDarkMode ? styles.darkItemValue : {}),
                }}
              >
                {getDepartmentName()}
              </div>
            </div>

            <div
              style={{
                ...styles.summaryItem,
                ...(isDarkMode ? styles.darkSummaryItem : {}),
              }}
            >
              <div
                style={{
                  ...styles.itemLabel,
                  ...(isDarkMode ? styles.darkItemLabel : {}),
                }}
              >
                Jours d'activité
              </div>
              <div
                style={{
                  ...styles.itemValue,
                  ...(isDarkMode ? styles.darkItemValue : {}),
                }}
              >
                {getActiveDays().join(", ")}
              </div>
            </div>

            <div
              style={{
                ...styles.summaryItem,
                ...(isDarkMode ? styles.darkSummaryItem : {}),
              }}
            >
              <div
                style={{
                  ...styles.itemLabel,
                  ...(isDarkMode ? styles.darkItemLabel : {}),
                }}
              >
                Préférences activées
              </div>
              <div style={styles.preferenceList}>
                {getActivePreferences().map((pref, index) => (
                  <span
                    key={index}
                    style={{
                      ...styles.preferenceBadge,
                      ...(isDarkMode ? styles.darkPreferenceBadge : {}),
                    }}
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Option pour enregistrer comme brouillon */}
        <div style={styles.saveAsDraftSection}>
          <Controller
            name="saveAsDraft"
            control={control}
            defaultValue={true}
            render={({ field }) => (
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <div
                  style={{
                    ...styles.customCheckbox,
                    ...(isDarkMode ? styles.darkCustomCheckbox : {}),
                    ...(field.value ? styles.checkedCustomCheckbox : {}),
                  }}
                >
                  {field.value && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    ...styles.checkboxLabelText,
                    ...(isDarkMode ? styles.darkCheckboxLabelText : {}),
                  }}
                >
                  Enregistrer comme brouillon après la génération
                </span>
              </label>
            )}
          />
        </div>

        {/* Section de génération */}
        <div style={styles.generateSection}>
          <div style={styles.robotIconContainer}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32 8C14.4 8 0 22.4 0 40v16h64V40c0-17.6-14.4-32-32-32z"
                fill="#f59e0b"
                opacity="0.2"
              />
              <path
                d="M48 48H16c-1.1 0-2-.9-2-2V26c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2z"
                fill="#f59e0b"
              />
              <path d="M44 30h-8v-4h8v4zm-16 0h-8v-4h8v4z" fill="#ffffff" />
              <path d="M36 40H28v-4h8v4z" fill="#ffffff" />
              <path
                d="M24 12v6h-4c0-3.3 1.3-6 4-6zm16 0c2.7 0 4 2.7 4 6h-4v-6z"
                fill="#f59e0b"
              />
              <path
                d="M40 16H24v-4c0-2.2 3.6-4 8-4s8 1.8 8 4v4z"
                fill="#f59e0b"
              />
            </svg>
          </div>

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            style={{
              ...styles.generateButton,
              ...(isHovered && !isGenerating ? styles.generateButtonHover : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isGenerating ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "50%",
                    borderTopColor: "#ffffff",
                  }}
                ></span>
                Génération en cours...
              </>
            ) : (
              "Générer le planning"
            )}
          </button>

          <p
            style={{
              ...styles.infoText,
              ...(isDarkMode ? styles.darkInfoText : {}),
            }}
          >
            La génération peut prendre jusqu'à 30 secondes selon la complexité
            des paramètres. Le planning généré sera ensuite disponible en tant
            que brouillon pour d'éventuels ajustements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepFour;
