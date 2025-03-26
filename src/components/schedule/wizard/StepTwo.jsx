import "moment/locale/fr";
import { Controller } from "react-hook-form";

// Constantes
const DAYS_OF_WEEK = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

const StepTwo = ({ control, errors, setValue }) => {
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
      backgroundColor: "#eff6ff",
      borderRadius: "0.5rem",
      padding: "1rem",
    },
    darkIcon: {
      backgroundColor: "#1e3a8a",
    },
    iconSvg: {
      width: "6rem",
      height: "6rem",
      color: "#3b82f6",
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
    dayGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
    },
    dayCard: {
      borderRadius: "0.5rem",
      padding: "1rem",
      border: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb",
    },
    darkDayCard: {
      border: "1px solid #374151",
      backgroundColor: "#111827",
    },
    dayHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    dayTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#1f2937",
    },
    darkDayTitle: {
      color: "#f3f4f6",
    },
    switch: {
      position: "relative",
      display: "inline-block",
      width: "2.5rem",
      height: "1.5rem",
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    slider: {
      position: "absolute",
      cursor: "pointer",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#e5e7eb",
      transition: "0.3s",
      borderRadius: "1rem",
    },
    darkSlider: {
      backgroundColor: "#4b5563",
    },
    sliderChecked: {
      backgroundColor: "#3b82f6",
    },
    sliderBefore: {
      position: "absolute",
      content: "",
      height: "1rem",
      width: "1rem",
      left: "0.25rem",
      bottom: "0.25rem",
      backgroundColor: "#ffffff",
      transition: "0.3s",
      borderRadius: "50%",
    },
    sliderBeforeChecked: {
      transform: "translateX(1rem)",
    },
    timeControls: {
      marginTop: "1rem",
    },
    timeLabel: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.5rem",
    },
    darkTimeLabel: {
      color: "#d1d5db",
    },
    timeWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "0.5rem",
    },
    timeValue: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#1f2937",
      minWidth: "3.5rem",
      textAlign: "center",
    },
    darkTimeValue: {
      color: "#f3f4f6",
    },
    timeRange: {
      flex: 1,
      marginLeft: "0.5rem",
      marginRight: "0.5rem",
      height: "0.25rem",
      appearance: "none",
      borderRadius: "0.125rem",
      backgroundColor: "#e5e7eb",
      outline: "none",
    },
    darkTimeRange: {
      backgroundColor: "#4b5563",
    },
    timeRangeThumb: {
      appearance: "none",
      width: "1rem",
      height: "1rem",
      backgroundColor: "#3b82f6",
      borderRadius: "50%",
      cursor: "pointer",
    },
    note: {
      marginTop: "1.5rem",
      padding: "0.75rem",
      backgroundColor: "#f3f4f6",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      color: "#4b5563",
    },
    darkNote: {
      backgroundColor: "#374151",
      color: "#d1d5db",
    },
    noteTitle: {
      fontWeight: "600",
      marginBottom: "0.25rem",
      color: "#1f2937",
    },
    darkNoteTitle: {
      color: "#f3f4f6",
    },
  };

  // Détection du thème sombre
  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Convertir les heures en format lisible
  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

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
            Définissez vos horaires d'activité
          </h2>
          <p
            style={{
              ...styles.description,
              ...(isDarkMode ? styles.darkDescription : {}),
            }}
          >
            Sélectionnez les jours actifs et définissez les heures d'ouverture
            et de fermeture pour chaque jour.
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire des heures d'ouverture */}
      <div
        style={{
          ...styles.formCard,
          ...(isDarkMode ? styles.darkFormCard : {}),
        }}
      >
        <div style={styles.dayGrid}>
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day.key}
              style={{
                ...styles.dayCard,
                ...(isDarkMode ? styles.darkDayCard : {}),
              }}
            >
              <div style={styles.dayHeader}>
                <span
                  style={{
                    ...styles.dayTitle,
                    ...(isDarkMode ? styles.darkDayTitle : {}),
                  }}
                >
                  {day.label}
                </span>
                <Controller
                  name={`businessDays.${day.key}.active`}
                  control={control}
                  defaultValue={day.key !== "sunday"}
                  render={({ field }) => (
                    <div style={styles.switch}>
                      <input
                        type="checkbox"
                        style={styles.switchInput}
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          // Réinitialiser les heures si le jour est désactivé
                          if (!e.target.checked) {
                            setValue(`businessDays.${day.key}.start`, 9);
                            setValue(`businessDays.${day.key}.end`, 17);
                          }
                        }}
                      />
                      <span
                        onClick={() => field.onChange(!field.value)}
                        style={{
                          ...styles.slider,
                          ...(isDarkMode ? styles.darkSlider : {}),
                          ...(field.value ? styles.sliderChecked : {}),
                        }}
                      >
                        <span
                          style={{
                            ...styles.sliderBefore,
                            ...(field.value ? styles.sliderBeforeChecked : {}),
                          }}
                        />
                      </span>
                    </div>
                  )}
                />
              </div>

              <Controller
                name={`businessDays.${day.key}.active`}
                control={control}
                defaultValue={day.key !== "sunday"}
                render={({ field }) => {
                  const isActive = field.value;

                  return isActive ? (
                    <div style={styles.timeControls}>
                      {/* Heure de début */}
                      <div>
                        <label
                          style={{
                            ...styles.timeLabel,
                            ...(isDarkMode ? styles.darkTimeLabel : {}),
                          }}
                        >
                          Heure d'ouverture
                        </label>
                        <Controller
                          name={`businessDays.${day.key}.start`}
                          control={control}
                          defaultValue={9}
                          render={({ field: startField }) => (
                            <div style={styles.timeWrapper}>
                              <span
                                style={{
                                  ...styles.timeValue,
                                  ...(isDarkMode ? styles.darkTimeValue : {}),
                                }}
                              >
                                {formatTime(startField.value)}
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="23.75"
                                step="0.25"
                                value={startField.value}
                                onChange={(e) => {
                                  const newStart = parseFloat(e.target.value);
                                  startField.onChange(newStart);

                                  // Vérifier si l'heure de fin est inférieure
                                  const end =
                                    control._formValues.businessDays[day.key]
                                      .end;
                                  if (end < newStart + 0.5) {
                                    setValue(
                                      `businessDays.${day.key}.end`,
                                      Math.min(newStart + 0.5, 23.75)
                                    );
                                  }
                                }}
                                style={{
                                  ...styles.timeRange,
                                  ...(isDarkMode ? styles.darkTimeRange : {}),
                                }}
                              />
                            </div>
                          )}
                        />
                      </div>

                      {/* Heure de fin */}
                      <div>
                        <label
                          style={{
                            ...styles.timeLabel,
                            ...(isDarkMode ? styles.darkTimeLabel : {}),
                          }}
                        >
                          Heure de fermeture
                        </label>
                        <Controller
                          name={`businessDays.${day.key}.end`}
                          control={control}
                          defaultValue={17}
                          render={({ field: endField }) => (
                            <div style={styles.timeWrapper}>
                              <span
                                style={{
                                  ...styles.timeValue,
                                  ...(isDarkMode ? styles.darkTimeValue : {}),
                                }}
                              >
                                {formatTime(endField.value)}
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="23.75"
                                step="0.25"
                                value={endField.value}
                                onChange={(e) => {
                                  const newEnd = parseFloat(e.target.value);
                                  endField.onChange(newEnd);

                                  // Vérifier si l'heure de début est supérieure
                                  const start =
                                    control._formValues.businessDays[day.key]
                                      .start;
                                  if (start > newEnd - 0.5) {
                                    setValue(
                                      `businessDays.${day.key}.start`,
                                      Math.max(newEnd - 0.5, 0)
                                    );
                                  }
                                }}
                                style={{
                                  ...styles.timeRange,
                                  ...(isDarkMode ? styles.darkTimeRange : {}),
                                }}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        ...styles.description,
                        ...(isDarkMode ? styles.darkDescription : {}),
                      }}
                    >
                      Jour non actif
                    </p>
                  );
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ ...styles.note, ...(isDarkMode ? styles.darkNote : {}) }}>
          <h4
            style={{
              ...styles.noteTitle,
              ...(isDarkMode ? styles.darkNoteTitle : {}),
            }}
          >
            Optimisation des horaires
          </h4>
          <p>
            Définissez avec précision vos heures d'activité pour chaque jour.
            Notre algorithme utilisera ces informations pour planifier
            efficacement les horaires des employés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
