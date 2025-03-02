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

// Constantes pour les colonnes du tableau des employés
export const EMPLOYEE_TABLE_COLUMNS = [
  {
    id: "name",
    header: "Nom",
    accessor: (employee) => `${employee.firstName} ${employee.lastName}`,
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
    id: "startDate",
    header: "Date d'embauche",
    accessor: (employee) => employee.startDate,
    sortable: true,
    type: "date",
  },
];
