/**
 * Données mockées pour les tests
 */

// Données mockées pour les vacations
export const mockVacations = [
  {
    id: 1,
    employee: {
      id: 1,
      first_name: "Jean",
      last_name: "Dupont",
      manager_id: 100,
    },
    type: "paid",
    start_date: "2023-07-10",
    end_date: "2023-07-15",
    duration: 5,
    status: "pending",
  },
  {
    id: 2,
    employee: {
      id: 2,
      first_name: "Marie",
      last_name: "Martin",
      manager_id: 100,
    },
    type: "sick",
    start_date: "2023-08-01",
    end_date: "2023-08-05",
    duration: 5,
    status: "approved",
  },
  {
    id: 3,
    employee: {
      id: 3,
      first_name: "Paul",
      last_name: "Durand",
      manager_id: 200,
    },
    type: "unpaid",
    start_date: "2023-09-20",
    end_date: "2023-09-25",
    duration: 5,
    status: "rejected",
  },
];

// Données mockées pour les employés
export const mockEmployees = [
  {
    id: 1,
    first_name: "Jean",
    last_name: "Dupont",
    email: "jean.dupont@example.com",
    phone: "0601020304",
    address: "1 rue de la Paix",
    city: "Paris",
    zip_code: "75001",
    department: "commercial",
    role: "vendeur",
    status: "active",
    birthdate: "1985-01-15",
    hire_date: "2020-03-01",
    contractHours: 35,
    manager_id: 100,
  },
  {
    id: 2,
    first_name: "Marie",
    last_name: "Martin",
    email: "marie.martin@example.com",
    phone: "0607080910",
    address: "2 rue du Commerce",
    city: "Lyon",
    zip_code: "69002",
    department: "administration",
    role: "comptable",
    status: "active",
    birthdate: "1990-05-20",
    hire_date: "2019-06-15",
    contractHours: 35,
    manager_id: 100,
  },
  {
    id: 3,
    first_name: "Paul",
    last_name: "Durand",
    email: "paul.durand@example.com",
    phone: "0611121314",
    address: "3 avenue des Champs-Élysées",
    city: "Paris",
    zip_code: "75008",
    department: "technique",
    role: "technicien",
    status: "active",
    birthdate: "1988-11-10",
    hire_date: "2021-01-10",
    contractHours: 40,
    manager_id: 200,
  },
];

// Données mockées pour les départements
export const mockDepartments = [
  {
    id: "administration",
    name: "Administration",
    employees: [mockEmployees[1]],
  },
  {
    id: "commercial",
    name: "Commercial",
    employees: [mockEmployees[0]],
  },
  {
    id: "technique",
    name: "Technique",
    employees: [mockEmployees[2]],
  },
];

// Utilisateur mockée (connecté)
export const mockUsers = {
  admin: {
    id: 100,
    username: "admin",
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    role: "admin",
  },
  manager: {
    id: 200,
    username: "manager",
    first_name: "Manager",
    last_name: "User",
    email: "manager@example.com",
    role: "manager",
  },
  employee: {
    id: 1,
    username: "employee",
    first_name: "Jean",
    last_name: "Dupont",
    email: "jean.dupont@example.com",
    role: "employee",
  },
};

// Messages d'erreur mockés
export const mockErrors = {
  networkError: "Erreur réseau. Veuillez vérifier votre connexion.",
  authError: "Vous devez être connecté pour accéder à ces données",
  loadError:
    "Erreur lors du chargement des données. Veuillez réessayer plus tard.",
};
