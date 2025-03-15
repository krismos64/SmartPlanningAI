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
  { value: "paid", label: "Congé payé" },
  { value: "unpaid", label: "Congé sans solde" },
  { value: "sick", label: "Congé maladie" },
  { value: "parental", label: "Congé parental" },
  { value: "other", label: "Autre" },
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

// URL de l'API
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";
