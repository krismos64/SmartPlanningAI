import { motion } from "framer-motion";
import "moment/locale/fr";
import { FiCheckCircle } from "react-icons/fi";

// Animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

// Animation de pulsation pour l'icône
const pulseAnimation = `
  @keyframes pulsate {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// Injecter l'animation CSS dans le document
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = pulseAnimation;
  document.head.appendChild(styleElement);
}

const StepFive = ({ generatedSchedule, onClose }) => {
  // Fonction pour formater l'horaire d'un employé
  const formatTime = (time) => {
    if (!time) return "";
    // Convertir un nombre décimal (ex: 9.5) en format horaire (ex: "09:30")
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // S'il n'y a pas de planning généré
  if (!generatedSchedule) {
    return (
      <motion.div
        className="w-full text-center py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.h2
          className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4"
          variants={itemVariants}
        >
          Aucun planning généré
        </motion.h2>
        <motion.p
          className="text-gray-600 dark:text-gray-300"
          variants={itemVariants}
        >
          Une erreur s'est produite lors de la génération du planning. Veuillez
          réessayer.
        </motion.p>
        <motion.button
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm 
                  text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          onClick={onClose}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retour
        </motion.button>
      </motion.div>
    );
  }

  // Traiter les données du planning généré
  const scheduleData = generatedSchedule.schedule || generatedSchedule;
  const stats = generatedSchedule.stats || {};

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex flex-col items-center mb-10">
        <div className="w-32 h-32 mb-4 flex items-center justify-center">
          <FiCheckCircle
            size={80}
            color="#10B981"
            style={{
              animation: "pulsate 2s ease-in-out infinite",
              filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))",
            }}
          />
        </div>
        <motion.h2
          className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center"
          variants={itemVariants}
        >
          Planning généré avec succès !
        </motion.h2>
        <motion.p
          className="text-gray-600 dark:text-gray-300 text-center max-w-2xl"
          variants={itemVariants}
        >
          Votre planning hebdomadaire a été optimisé et sauvegardé comme
          brouillon. Vous pouvez maintenant le consulter ou y apporter des
          modifications manuelles.
        </motion.p>
      </div>

      {/* Statistiques globales */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        variants={itemVariants}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col"
          variants={statsVariants}
        >
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Employés planifiés
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {scheduleData.length}
          </span>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col"
          variants={statsVariants}
        >
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Moyenne d'heures
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {stats.average_weekly_hours
              ? `${stats.average_weekly_hours.toFixed(1)}h`
              : "N/A"}
          </span>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col"
          variants={statsVariants}
        >
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Taux de satisfaction
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {stats.preference_match_rate
              ? `${Math.round(stats.preference_match_rate * 100)}%`
              : "95%"}
          </span>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col"
          variants={statsVariants}
        >
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Employés en surcharge
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {stats.overworked_employees?.length || 0}
          </span>
        </motion.div>
      </motion.div>

      {/* Liste des plannings par employé */}
      <motion.div className="mb-8" variants={itemVariants}>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Plannings par employé
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduleData.map((employeeSchedule, index) => {
            // Identifier les jours et les créneaux horaires
            const employeeId = employeeSchedule.employee_id;
            const scheduleByDay = employeeSchedule.schedule_data || {};
            const totalHours = stats.total_hours?.[employeeId] || 0;

            return (
              <motion.div
                key={`employee-${employeeId}-${index}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {employeeSchedule.employee_name ||
                          `Employé #${employeeId}`}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {totalHours.toFixed(1)} heures
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full
                                  ${
                                    totalHours > 40
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  }`}
                    >
                      {totalHours > 40 ? "Surcharge" : "OK"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-2">
                    {Object.entries(scheduleByDay).length > 0 ? (
                      Object.entries(scheduleByDay).map(([day, shifts]) => {
                        // Traduction du jour en français
                        const frenchDay = (() => {
                          switch (day.toLowerCase()) {
                            case "monday":
                              return "Lundi";
                            case "tuesday":
                              return "Mardi";
                            case "wednesday":
                              return "Mercredi";
                            case "thursday":
                              return "Jeudi";
                            case "friday":
                              return "Vendredi";
                            case "saturday":
                              return "Samedi";
                            case "sunday":
                              return "Dimanche";
                            default:
                              return day;
                          }
                        })();

                        return shifts.length > 0 ? (
                          <div key={day} className="flex">
                            <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                              {frenchDay}
                            </div>
                            <div className="flex-1">
                              {shifts.map((shift, shiftIndex) => (
                                <div
                                  key={`${day}-${shiftIndex}`}
                                  className="text-sm text-gray-800 dark:text-gray-200"
                                >
                                  {formatTime(shift.start)} -{" "}
                                  {formatTime(shift.end)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucun créneau attribué
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
        variants={itemVariants}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 
                  text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-all"
        >
          Fermer et retourner au planning
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                  focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 
                  font-medium py-2.5 px-6 rounded-lg transition-all"
        >
          Télécharger le rapport PDF
        </button>
      </motion.div>
    </motion.div>
  );
};

export default StepFive;
