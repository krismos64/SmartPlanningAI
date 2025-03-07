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

// Constantes pour les congés
export const VACATION_TYPES = [
  { value: "paid", label: "Congés payés", color: "#4CAF50", defaultQuota: 25 },
  { value: "rtt", label: "RTT", color: "#2196F3", defaultQuota: 11 },
  {
    value: "unpaid",
    label: "Congés sans solde",
    color: "#9E9E9E",
    defaultQuota: null,
  },
  { value: "sick", label: "Maladie", color: "#F44336", defaultQuota: null },
  {
    value: "exceptional",
    label: "Absence exceptionnelle",
    color: "#FF9800",
    defaultQuota: null,
  },
  {
    value: "recovery",
    label: "Récupération",
    color: "#9C27B0",
    defaultQuota: null,
  },
];

export const VACATION_STATUSES = [
  { value: "pending", label: "En attente", color: "#FFC107" },
  { value: "approved", label: "Approuvé", color: "#4CAF50" },
  { value: "rejected", label: "Refusé", color: "#F44336" },
];

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
