// Constantes pour les employés
export const EMPLOYEE_DEPARTMENTS = [
  { value: "Marketing", label: "Marketing" },
  { value: "Développement", label: "Développement" },
  { value: "Design", label: "Design" },
  { value: "Finance", label: "Finance" },
  { value: "RH", label: "RH" },
];

export const EMPLOYEE_ROLES = [
  { value: "Manager", label: "Manager" },
  { value: "Senior", label: "Senior" },
  { value: "Junior", label: "Junior" },
  { value: "Stagiaire", label: "Stagiaire" },
];

export const EMPLOYEE_STATUSES = [
  { value: "active", label: "Actif" },
  { value: "pending", label: "En attente" },
  { value: "inactive", label: "Inactif" },
];

/**
 * Types de congés disponibles
 */
export const VACATION_TYPES = [
  { value: "paid", label: "Congé payé", color: "#4F46E5" },
  { value: "unpaid", label: "Congé sans solde", color: "#9CA3AF" },
  { value: "sick", label: "Congé maladie", color: "#EF4444" },
  { value: "parental", label: "Congé parental", color: "#10B981" },
  { value: "other", label: "Autre", color: "#F59E0B" },
];

/**
 * Statuts des congés
 */
export const VACATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

/**
 * Rôles des utilisateurs
 */
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

/**
 * Formats de date
 */
export const DATE_FORMATS = {
  DEFAULT: "dd/MM/yyyy",
  DISPLAY: "dd MMMM yyyy",
  API: "yyyy-MM-dd",
};

/**
 * Constantes pour la pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
};

// Jours fériés en France pour 2024 (à mettre à jour chaque année)
export const FRENCH_HOLIDAYS_2024 = [
  { date: "2024-01-01", name: "Jour de l'an" },
  { date: "2024-04-01", name: "Lundi de Pâques" },
  { date: "2024-05-01", name: "Fête du Travail" },
  { date: "2024-05-08", name: "Victoire 1945" },
  { date: "2024-05-09", name: "Ascension" },
  { date: "2024-05-20", name: "Lundi de Pentecôte" },
  { date: "2024-07-14", name: "Fête Nationale" },
  { date: "2024-08-15", name: "Assomption" },
  { date: "2024-11-01", name: "Toussaint" },
  { date: "2024-11-11", name: "Armistice 1918" },
  { date: "2024-12-25", name: "Noël" },
];

// Constantes pour les colonnes du tableau des employés
export const EMPLOYEE_TABLE_COLUMNS = [
  {
    id: "name",
    header: "Nom",
    accessor: (employee) => `${employee.first_name} ${employee.last_name}`,
    sortable: true,
  },
  {
    id: "email",
    header: "Email",
    accessor: (employee) => employee.email,
    sortable: true,
  },
  {
    id: "department",
    header: "Département",
    accessor: (employee) => employee.department,
    sortable: true,
  },
  {
    id: "role",
    header: "Rôle",
    accessor: (employee) => employee.role,
    sortable: true,
  },
  {
    id: "status",
    header: "Statut",
    accessor: (employee) => employee.status,
    sortable: true,
    type: "status",
  },
  {
    id: "hour_balance",
    header: "Solde d'heures",
    accessor: (employee) => {
      const balance = employee.hour_balance || 0;
      const isPositive = balance >= 0;
      return {
        value: balance,
        display: `${isPositive ? "+" : ""}${balance}h`,
        isPositive,
      };
    },
    sortable: true,
    type: "hour_balance",
  },
  {
    id: "hire_date",
    header: "Date d'embauche",
    accessor: (employee) => {
      if (!employee.hire_date) return "";
      const date = new Date(employee.hire_date);
      return date.toLocaleDateString("fr-FR");
    },
    sortable: true,
    type: "date",
  },
];

// Constantes pour les colonnes du tableau des demandes de congés
export const VACATION_TABLE_COLUMNS = [
  {
    id: "employee",
    header: "Employé",
    accessor: (vacation) => {
      // Construction standardisée du nom d'employé comme dans la table des employés
      if (vacation.employee_name && vacation.employee_name.trim() !== "") {
        return vacation.employee_name;
      } else if (
        vacation.employee &&
        vacation.employee.first_name &&
        vacation.employee.last_name
      ) {
        return `${vacation.employee.first_name} ${vacation.employee.last_name}`;
      } else if (vacation.employee_first_name && vacation.employee_last_name) {
        return `${vacation.employee_first_name} ${vacation.employee_last_name}`;
      } else if (vacation.first_name && vacation.last_name) {
        return `${vacation.first_name} ${vacation.last_name}`;
      } else {
        return `Employé #${vacation.employee_id || "?"}`;
      }
    },
    sortable: true,
  },
  {
    id: "type",
    header: "Type",
    accessor: (vacation) => vacation.type,
    sortable: true,
  },
  {
    id: "start_date",
    header: "Date de début",
    accessor: (vacation) => {
      if (!vacation.start_date && !vacation.startDate) return "";
      const date = new Date(vacation.start_date || vacation.startDate);
      return date.toLocaleDateString("fr-FR");
    },
    sortable: true,
    type: "date",
  },
  {
    id: "end_date",
    header: "Date de fin",
    accessor: (vacation) => {
      if (!vacation.end_date && !vacation.endDate) return "";
      const date = new Date(vacation.end_date || vacation.endDate);
      return date.toLocaleDateString("fr-FR");
    },
    sortable: true,
    type: "date",
  },
  {
    id: "duration",
    header: "Durée",
    accessor: (vacation) => {
      if (vacation.duration) {
        return `${vacation.duration} jour${vacation.duration > 1 ? "s" : ""}`;
      }
      return "-";
    },
    sortable: true,
  },
  {
    id: "status",
    header: "Statut",
    accessor: (vacation) => vacation.status,
    sortable: true,
    type: "status",
  },
];

// URL de l'API
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";
