import moment from "moment";
import "moment/locale/fr";
import { Controller } from "react-hook-form";

const StepOne = ({ control, errors, departments = [] }) => {
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
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.5rem",
    },
    darkLabel: {
      color: "#d1d5db",
    },
    inputWrapper: {
      position: "relative",
    },
    input: {
      width: "100%",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      color: "#1f2937",
      padding: "0.625rem 1rem",
      fontSize: "0.875rem",
      outline: "none",
      transition: "all 0.2s ease",
    },
    darkInput: {
      border: "1px solid #4b5563",
      backgroundColor: "#374151",
      color: "#f3f4f6",
    },
    inputIcon: {
      position: "absolute",
      right: "0.75rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
    },
    darkInputIcon: {
      color: "#9ca3af",
    },
    select: {
      width: "100%",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      color: "#1f2937",
      padding: "0.625rem 2.5rem 0.625rem 1rem",
      fontSize: "0.875rem",
      outline: "none",
      appearance: "none",
      transition: "all 0.2s ease",
    },
    darkSelect: {
      border: "1px solid #4b5563",
      backgroundColor: "#374151",
      color: "#f3f4f6",
    },
    errorText: {
      fontSize: "0.75rem",
      color: "#ef4444",
      marginTop: "0.25rem",
    },
    hintText: {
      fontSize: "0.75rem",
      color: "#6b7280",
      marginTop: "0.375rem",
    },
    darkHintText: {
      color: "#9ca3af",
    },
  };

  // Détection du thème sombre
  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

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
            Choisissez la semaine et le département
          </h2>
          <p
            style={{
              ...styles.description,
              ...(isDarkMode ? styles.darkDescription : {}),
            }}
          >
            Sélectionnez la date de début de semaine et le département pour
            lequel vous souhaitez générer un planning.
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div
        style={{
          ...styles.formCard,
          ...(isDarkMode ? styles.darkFormCard : {}),
        }}
      >
        <div style={styles.formGroup}>
          <label
            htmlFor="weekStartDate"
            style={{ ...styles.label, ...(isDarkMode ? styles.darkLabel : {}) }}
          >
            Date de début de semaine
          </label>
          <Controller
            name="weekStartDate"
            control={control}
            rules={{ required: "Ce champ est requis" }}
            render={({ field }) => (
              <div style={styles.inputWrapper}>
                <input
                  id="weekStartDate"
                  type="date"
                  style={{
                    ...styles.input,
                    ...(isDarkMode ? styles.darkInput : {}),
                  }}
                  {...field}
                  onChange={(e) => {
                    const date = e.target.value;
                    // S'assurer que c'est un lundi (la semaine ISO commence le lundi)
                    const selectedDate = moment(date);
                    const weekStart = selectedDate
                      .startOf("isoWeek")
                      .format("YYYY-MM-DD");
                    field.onChange(weekStart);
                  }}
                />
                <div
                  style={{
                    ...styles.inputIcon,
                    ...(isDarkMode ? styles.darkInputIcon : {}),
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          />
          {errors.weekStartDate && (
            <p style={styles.errorText}>{errors.weekStartDate.message}</p>
          )}
          <p
            style={{
              ...styles.hintText,
              ...(isDarkMode ? styles.darkHintText : {}),
            }}
          >
            La semaine commencera toujours un lundi conformément au standard
            ISO.
          </p>
        </div>

        <div>
          <label
            htmlFor="departmentId"
            style={{ ...styles.label, ...(isDarkMode ? styles.darkLabel : {}) }}
          >
            Département
          </label>
          <Controller
            name="departmentId"
            control={control}
            rules={{ required: "Veuillez sélectionner un département" }}
            render={({ field }) => (
              <div style={styles.inputWrapper}>
                <select
                  id="departmentId"
                  style={{
                    ...styles.select,
                    ...(isDarkMode ? styles.darkSelect : {}),
                  }}
                  {...field}
                >
                  <option value="">Sélectionnez un département</option>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="all">Tous les départements</option>
                      <option value="1">Service client</option>
                      <option value="2">Logistique</option>
                      <option value="3">Administration</option>
                    </>
                  )}
                </select>
                <div
                  style={{
                    ...styles.inputIcon,
                    ...(isDarkMode ? styles.darkInputIcon : {}),
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            )}
          />
          {errors.departmentId && (
            <p style={styles.errorText}>{errors.departmentId.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepOne;
