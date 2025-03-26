import { Controller } from "react-hook-form";

const StepThree = ({ control, errors }) => {
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
      backgroundColor: "#f0fdf4",
      borderRadius: "0.5rem",
      padding: "1rem",
    },
    darkIcon: {
      backgroundColor: "#14532d",
    },
    iconSvg: {
      width: "6rem",
      height: "6rem",
      color: "#22c55e",
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
    preferencesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "1rem",
    },
    preferenceCard: {
      padding: "1rem",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb",
      transition: "all 0.2s ease",
    },
    darkPreferenceCard: {
      border: "1px solid #374151",
      backgroundColor: "#111827",
    },
    preferenceCardActive: {
      borderColor: "#22c55e",
      backgroundColor: "#f0fdf4",
    },
    darkPreferenceCardActive: {
      borderColor: "#22c55e",
      backgroundColor: "#0f172a",
    },
    preferenceLabel: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    checkboxContainer: {
      position: "relative",
      width: "1.5rem",
      height: "1.5rem",
      marginRight: "0.75rem",
    },
    checkbox: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0,
    },
    checkboxDisplay: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1.5rem",
      height: "1.5rem",
      backgroundColor: "#ffffff",
      border: "2px solid #d1d5db",
      borderRadius: "0.25rem",
      transition: "all 0.2s ease",
    },
    darkCheckboxDisplay: {
      backgroundColor: "#1f2937",
      border: "2px solid #4b5563",
    },
    checkboxDisplayChecked: {
      backgroundColor: "#22c55e",
      borderColor: "#22c55e",
    },
    checkmark: {
      color: "#ffffff",
      width: "1rem",
      height: "1rem",
      opacity: 0,
      transition: "opacity 0.2s ease",
    },
    checkmarkVisible: {
      opacity: 1,
    },
    preferenceName: {
      fontWeight: "600",
      color: "#1f2937",
      fontSize: "0.875rem",
    },
    darkPreferenceName: {
      color: "#f3f4f6",
    },
    preferenceDescription: {
      marginTop: "0.5rem",
      color: "#4b5563",
      fontSize: "0.75rem",
    },
    darkPreferenceDescription: {
      color: "#9ca3af",
    },
    tipsSection: {
      marginTop: "2rem",
      padding: "1rem",
      borderRadius: "0.5rem",
      backgroundColor: "#f3f4f6",
    },
    darkTipsSection: {
      backgroundColor: "#374151",
    },
    tipsTitle: {
      display: "flex",
      alignItems: "center",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "0.75rem",
    },
    darkTipsTitle: {
      color: "#f3f4f6",
    },
    tipsList: {
      listStyleType: "disc",
      paddingLeft: "1rem",
    },
    tipsItem: {
      color: "#4b5563",
      marginBottom: "0.5rem",
      fontSize: "0.875rem",
    },
    darkTipsItem: {
      color: "#d1d5db",
    },
  };

  // Détection du thème sombre
  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Options de préférences à afficher
  const preferenceOptions = [
    {
      id: "respectAvailability",
      name: "Respect des disponibilités",
      description:
        "Prend en compte les disponibilités indiquées par les employés dans la génération du planning",
    },
    {
      id: "minimizeOvertime",
      name: "Minimiser les heures supplémentaires",
      description:
        "Tente de limiter les heures travaillées au-delà du contrat de l'employé",
    },
    {
      id: "balanceWeekends",
      name: "Équilibrer les weekends",
      description:
        "Répartit équitablement les jours de travail pendant les weekends entre les employés",
    },
    {
      id: "balanceWorkload",
      name: "Équilibrer la charge de travail",
      description:
        "Distribue les heures de travail de manière équitable selon les contrats",
    },
    {
      id: "optimizeBreaks",
      name: "Optimiser les pauses",
      description:
        "Planifie les pauses de manière à maximiser la couverture pendant les heures de pointe",
    },
    {
      id: "balanceRoles",
      name: "Équilibrer les rôles",
      description:
        "Assure une répartition équilibrée des différents rôles sur chaque plage horaire",
    },
  ];

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
            Choisissez les préférences de planification
          </h2>
          <p
            style={{
              ...styles.description,
              ...(isDarkMode ? styles.darkDescription : {}),
            }}
          >
            Sélectionnez les critères d'optimisation que vous souhaitez
            appliquer lors de la génération de votre planning.
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire des préférences */}
      <div
        style={{
          ...styles.formCard,
          ...(isDarkMode ? styles.darkFormCard : {}),
        }}
      >
        <div style={styles.preferencesGrid}>
          {preferenceOptions.map((option) => (
            <Controller
              key={option.id}
              name={`preferences.${option.id}`}
              control={control}
              defaultValue={true}
              render={({ field }) => {
                const isActive = field.value;
                return (
                  <div
                    style={{
                      ...styles.preferenceCard,
                      ...(isDarkMode ? styles.darkPreferenceCard : {}),
                      ...(isActive && styles.preferenceCardActive),
                      ...(isActive &&
                        isDarkMode &&
                        styles.darkPreferenceCardActive),
                    }}
                  >
                    <label style={styles.preferenceLabel}>
                      <div style={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          style={styles.checkbox}
                          checked={isActive}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <div
                          style={{
                            ...styles.checkboxDisplay,
                            ...(isDarkMode ? styles.darkCheckboxDisplay : {}),
                            ...(isActive && styles.checkboxDisplayChecked),
                          }}
                        >
                          <svg
                            style={{
                              ...styles.checkmark,
                              ...(isActive && styles.checkmarkVisible),
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <span
                        style={{
                          ...styles.preferenceName,
                          ...(isDarkMode ? styles.darkPreferenceName : {}),
                        }}
                      >
                        {option.name}
                      </span>
                    </label>
                    <p
                      style={{
                        ...styles.preferenceDescription,
                        ...(isDarkMode ? styles.darkPreferenceDescription : {}),
                      }}
                    >
                      {option.description}
                    </p>
                  </div>
                );
              }}
            />
          ))}
        </div>

        <div
          style={{
            ...styles.tipsSection,
            ...(isDarkMode ? styles.darkTipsSection : {}),
          }}
        >
          <h3
            style={{
              ...styles.tipsTitle,
              ...(isDarkMode ? styles.darkTipsTitle : {}),
            }}
          >
            <svg
              style={{
                width: "1.25rem",
                height: "1.25rem",
                marginRight: "0.5rem",
                color: "#22c55e",
              }}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Conseils d'optimisation
          </h3>
          <ul style={styles.tipsList}>
            <li
              style={{
                ...styles.tipsItem,
                ...(isDarkMode ? styles.darkTipsItem : {}),
              }}
            >
              Activer plus de préférences donnera un planning plus équilibré
            </li>
            <li
              style={{
                ...styles.tipsItem,
                ...(isDarkMode ? styles.darkTipsItem : {}),
              }}
            >
              Le respect des disponibilités est toujours prioritaire
            </li>
            <li
              style={{
                ...styles.tipsItem,
                ...(isDarkMode ? styles.darkTipsItem : {}),
              }}
            >
              L'équilibrage des rôles est recommandé pour les équipes
              multidisciplinaires
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
