// Mock pour le modèle Employee
const mockEmployee = {
  find: jest.fn(),
  findById: jest.fn(),
  findByManager: jest.fn(),
  save: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
};

// Mock pour le modèle User
const mockUser = {
  find: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  save: jest.fn().mockImplementation(function () {
    if (this.id) {
      return Promise.resolve(this);
    } else {
      this.id = Math.floor(Math.random() * 1000) + 1;
      return Promise.resolve(this);
    }
  }),
  create: jest.fn().mockImplementation((userData) => {
    const user = new MockUserClass(userData);
    return user.save();
  }),
  findByIdAndUpdate: jest.fn(),
  delete: jest.fn(),
  comparePassword: jest.fn().mockImplementation(function (password) {
    // Simuler la comparaison de mots de passe
    if (this.password === "hashed_password" && password === "password") {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }),
};

// Classe pour instancier des utilisateurs mockés
class MockUserClass {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "admin";
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.profileImage = data.profileImage;
    this.company = data.company;
    this.phone = data.phone;
    this.jobTitle = data.jobTitle;
    this.save = mockUser.save;
    this.comparePassword = mockUser.comparePassword;
  }
}

// Définir le constructeur sur la fonction mock
mockUser.prototype = new MockUserClass();
mockUser.prototype.constructor = MockUserClass;

// Mock pour le modèle Department
const mockDepartment = {
  find: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findByManager: jest.fn(),
  findByManagerId: jest.fn(), // Méthode utilisée dans les tests
  getEmployees: jest.fn(),
  create: jest.fn(),
  save: jest.fn().mockImplementation(function () {
    return Promise.resolve(this);
  }),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock pour le modèle VacationRequest
const mockVacationRequest = jest.fn().mockImplementation((data) => {
  return {
    id: data.id,
    employee_id: data.employee_id,
    employee_name: data.employee_name,
    creator_id: data.creator_id,
    type: data.type || "paid",
    start_date: data.start_date,
    end_date: data.end_date,
    duration: data.duration,
    reason: data.reason,
    status: data.status || "pending",
    approved_by: data.approved_by ? parseInt(data.approved_by) : null,
    approved_at: data.approved_at,
    rejected_by: data.rejected_by ? parseInt(data.rejected_by) : null,
    rejected_at: data.rejected_at,
    attachment: data.attachment,
    quota_exceeded: data.quota_exceeded || false,
    created_at: data.created_at,
    updated_at: data.updated_at,
    save: jest.fn().mockResolvedValue(data),
  };
});

// Mock pour le modèle Activity
const mockActivity = {
  logActivity: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

// Mock pour le modèle Notification
const mockNotification = {
  createAndBroadcast: jest.fn(),
  find: jest.fn(),
  findByUserId: jest.fn(),
  markAsRead: jest.fn(),
};

// Configuration des mocks pour les modèles
jest.mock("../../models/Employee", () => mockEmployee);
jest.mock("../../models/User", () => mockUser);
jest.mock("../../models/Department", () => mockDepartment);
jest.mock("../../models/VacationRequest", () => mockVacationRequest);
jest.mock("../../models/Activity", () => mockActivity);
jest.mock("../../models/Notification", () => mockNotification);

// Exporter les mocks pour pouvoir les utiliser dans les tests
module.exports = {
  mockEmployee,
  mockUser,
  mockDepartment,
  mockVacationRequest,
  mockActivity,
  mockNotification,
};
