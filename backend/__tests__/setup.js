// Mock la connexion à la base de données
jest.mock("../config/db", () => {
  // Créer des fonctions mock plus complètes
  const mockExecute = jest.fn().mockImplementation((query, params) => {
    return Promise.resolve([[], {}]);
  });

  const mockQuery = jest.fn().mockImplementation((query, params, callback) => {
    if (callback) {
      callback(null, []);
      return;
    }
    return Promise.resolve([[], {}]);
  });

  const mockGetConnection = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      query: mockQuery,
      execute: mockExecute,
      release: jest.fn(),
    });
  });

  // Mock complet du pool de connexion
  return {
    execute: mockExecute,
    query: mockQuery,
    getConnection: mockGetConnection,
    escape: jest.fn((val) => val),
    format: jest.fn((sql, values) => sql),
    on: jest.fn(),
    end: jest.fn(),
    pool: {
      on: jest.fn(),
    },
  };
});

// Mock pour bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockImplementation((password, salt) => {
    return Promise.resolve("$2a$10$hashedpasswordmock");
  }),
  genSalt: jest.fn().mockImplementation((rounds) => {
    return Promise.resolve("$2a$10$saltmock");
  }),
  compare: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
    // Simuler une correspondance réussie si le mot de passe est "password"
    return Promise.resolve(plainPassword === "password");
  }),
}));

// Mock pour bcryptjs (utilisé comme alternative à bcrypt)
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockImplementation((password, salt) => {
    return Promise.resolve("$2a$10$hashedpasswordmock");
  }),
  genSalt: jest.fn().mockImplementation((rounds) => {
    return Promise.resolve("$2a$10$saltmock");
  }),
  compare: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
    // Simuler une correspondance réussie si le mot de passe est "password"
    return Promise.resolve(plainPassword === "password");
  }),
}));

// Temps d'exécution plus long pour les tests d'API
jest.setTimeout(30000);

// Variables globales pour les tests
global.testUsers = {
  admin1: {
    id: 1,
    email: "admin1@test.com",
    role: "admin",
    first_name: "Admin",
    last_name: "One",
  },
  admin2: {
    id: 2,
    email: "admin2@test.com",
    role: "admin",
    first_name: "Admin",
    last_name: "Two",
  },
};

global.testEmployees = {
  employee1: { id: 1, first_name: "John", last_name: "Doe", manager_id: 1 },
  employee2: { id: 2, first_name: "Jane", last_name: "Smith", manager_id: 1 },
  employee3: { id: 3, first_name: "Bob", last_name: "Brown", manager_id: 2 },
};

global.testVacationRequests = {
  vacation1: {
    id: 1,
    employee_id: 1,
    type: "paid",
    start_date: "2025-03-25",
    end_date: "2025-03-30",
    status: "pending",
    approved_by: null,
    rejected_by: null,
    employee_name: "John Doe",
  },
  vacation2: {
    id: 2,
    employee_id: 2,
    type: "sick",
    start_date: "2025-04-01",
    end_date: "2025-04-03",
    status: "approved",
    approved_by: 1,
    rejected_by: null,
    employee_name: "Jane Smith",
  },
  vacation3: {
    id: 3,
    employee_id: 3,
    type: "unpaid",
    start_date: "2025-04-10",
    end_date: "2025-04-15",
    status: "rejected",
    approved_by: null,
    rejected_by: 2,
    employee_name: "Bob Brown",
  },
};

// Fonction helper pour créer un mock de req, res, next pour les tests de middleware
global.createMockRequestResponse = () => {
  const req = {
    user: { ...global.testUsers.admin1 },
    params: {},
    body: {},
    query: {},
    cookies: {},
    headers: {},
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    cookie: jest.fn(),
  };

  const next = jest.fn();

  return { req, res, next };
};

// Au moins un test pour éviter l'erreur "Your test suite must contain at least one test"
test("setup file should be properly loaded", () => {
  expect(true).toBe(true);
});

// Réinitialiser les mocks entre chaque test
afterEach(() => {
  jest.clearAllMocks();
});
