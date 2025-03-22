import {
  FiCheck,
  FiEdit,
  FiInfo,
  FiPlus,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";

/**
 * Obtient la couleur en fonction du type d'activité
 * @param {string} type - Le type d'activité
 * @param {string} entity_type - Le type d'entité
 * @returns {string} - La couleur correspondante
 */
export const getActivityColor = (type, entity_type) => {
  // Si c'est une activité liée aux congés, utiliser une couleur spécifique
  if (entity_type === "vacation") {
    return "#6366F1"; // indigo pour les congés
  }

  // Sinon, utiliser la couleur en fonction du type d'activité
  switch (type) {
    case "create":
      return "#10B981"; // vert
    case "update":
      return "#F59E0B"; // orange
    case "delete":
      return "#EF4444"; // rouge
    case "approve":
      return "#3B82F6"; // bleu
    case "reject":
      return "#EC4899"; // rose
    case "system":
      return "#8B5CF6"; // violet
    case "vacation_status_update":
      return "#6366F1"; // indigo
    default:
      return "#4F46E5"; // indigo (par défaut)
  }
};

/**
 * Obtient l'icône en fonction du type d'activité
 * @param {string} type - Le type d'activité
 * @param {string} entity_type - Le type d'entité
 * @returns {JSX.Element} - L'icône correspondante
 */
export const getActivityIcon = (type, entity_type) => {
  // Si c'est une activité liée aux congés, utiliser une icône spécifique
  if (entity_type === "vacation") {
    return <FiSun />;
  }

  // Sinon, utiliser l'icône en fonction du type d'activité
  switch (type) {
    case "create":
      return <FiPlus />;
    case "update":
      return <FiEdit />;
    case "delete":
      return <FiTrash2 />;
    case "approve":
      return <FiCheck />;
    case "reject":
      return <FiX />;
    case "system":
      return <FiInfo />;
    case "vacation_status_update":
      return <FiSun />;
    default:
      return <FiInfo />;
  }
};

/**
 * Traduit le type de congé en français
 * @param {string} type - Le type de congé en anglais
 * @returns {string} - Le type de congé en français
 */
export const translateVacationType = (type) => {
  switch (type) {
    case "paid":
      return "payé";
    case "unpaid":
      return "non payé";
    case "sick":
      return "maladie";
    case "other":
      return "autre";
    default:
      return type || "non spécifié";
  }
};

/**
 * Traduit le statut de congé en français
 * @param {string} status - Le statut de congé en anglais
 * @returns {string} - Le statut de congé en français
 */
export const translateVacationStatus = (status) => {
  switch (status) {
    case "approved":
      return "approuvé";
    case "rejected":
      return "rejeté";
    case "pending":
      return "en attente";
    default:
      return status || "non spécifié";
  }
};

/**
 * Obtient le libellé en fonction du type d'activité
 * @param {string} type - Le type d'activité
 * @param {string} entity_type - Le type d'entité
 * @param {Object} details - Les détails de l'activité
 * @returns {string} - Le libellé correspondant
 */
export const getActivityTypeLabel = (type, entity_type, details) => {
  // Si c'est une activité liée aux congés, utiliser un libellé spécifique
  if (entity_type === "vacation") {
    // Récupérer le type de congé si disponible
    let vacationType = "";
    if (details && typeof details === "object") {
      if (details.type) {
        vacationType = translateVacationType(details.type);
      } else if (details.vacation_type) {
        vacationType = translateVacationType(details.vacation_type);
      }
    }

    switch (type) {
      case "create":
        return "Nouvelle demande";
      case "update":
        return "Modification congé";
      case "delete":
        return "Suppression congé";
      case "approve":
        return "Approbation congé";
      case "reject":
        return "Rejet congé";
      case "vacation_status_update":
        // Récupérer le nouveau statut si disponible
        if (details && typeof details === "object" && details.new_status) {
          if (details.new_status === "approved") {
            return "Congé approuvé";
          } else if (details.new_status === "rejected") {
            return "Congé rejeté";
          } else if (details.new_status === "pending") {
            return "Congé en attente";
          }
        }
        return "Changement statut";
      default:
        return `Congé`;
    }
  }

  // Sinon, utiliser le libellé en fonction du type d'activité
  switch (type) {
    case "create":
      return "Création";
    case "update":
      return "Modification";
    case "delete":
      return "Suppression";
    case "approve":
      return "Approbation";
    case "reject":
      return "Rejet";
    case "system":
      return "Système";
    case "vacation_status_update":
      return "Mise à jour statut";
    default:
      return "Information";
  }
};
