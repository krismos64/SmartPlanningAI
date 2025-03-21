const Employee = require("../../models/Employee");
const db = require("../../config/db");

// Mocks
jest.mock("../../config/db", () => ({
  execute: jest.fn(),
  query: jest.fn(),
}));

describe("Employee Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    it("devrait initialiser les propriétés correctement", () => {
      // Arrange & Act
      const employeeData = {
        id: 1,
        manager_id: 5,
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@test.com",
        phone: "0612345678",
        role: "Développeur",
        department: 3,
        hire_date: "2022-01-15",
        status: "active",
        birthdate: "1990-05-20",
        address: "123 Rue Test",
        city: "Paris",
        zip_code: "75001",
        contractHours: 35,
        created_at: "2022-01-15 10:00:00",
        updated_at: "2022-02-20 15:30:00",
      };

      const employee = new Employee(employeeData);

      // Assert
      expect(employee.id).toBe(employeeData.id);
      expect(employee.manager_id).toBe(employeeData.manager_id);
      expect(employee.first_name).toBe(employeeData.first_name);
      expect(employee.last_name).toBe(employeeData.last_name);
      expect(employee.email).toBe(employeeData.email);
      expect(employee.phone).toBe(employeeData.phone);
      expect(employee.role).toBe(employeeData.role);
      expect(employee.department).toBe(employeeData.department);
      expect(employee.hire_date).toBe(employeeData.hire_date);
      expect(employee.status).toBe(employeeData.status);
      expect(employee.birthdate).toBe(employeeData.birthdate);
      expect(employee.address).toBe(employeeData.address);
      expect(employee.city).toBe(employeeData.city);
      expect(employee.zip_code).toBe(employeeData.zip_code);
      expect(employee.contractHours).toBe(employeeData.contractHours);
      expect(employee.status).toBe("active");
    });

    it("devrait initialiser avec des valeurs par défaut si les données sont manquantes", () => {
      // Arrange & Act
      const employee = new Employee();

      // Assert
      expect(employee.status).toBe("active");
      expect(employee.contractHours).toBe(35);
      expect(employee.hour_balance).toBe(0);
      expect(employee.created_at).toBeInstanceOf(Date);
      expect(employee.updated_at).toBeInstanceOf(Date);
    });
  });

  describe("save()", () => {
    it("devrait créer un nouvel employé", async () => {
      // Arrange
      const employeeData = {
        manager_id: 5,
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@test.com",
        status: "active",
      };

      const employee = new Employee(employeeData);
      const insertId = 10;

      db.execute.mockResolvedValueOnce([{ insertId }]);

      // Act
      await employee.save();

      // Assert
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO employees"),
        expect.arrayContaining([
          employee.first_name,
          employee.last_name,
          employee.email,
          employee.status,
          employee.manager_id,
        ])
      );
      expect(employee.id).toBe(insertId);
    });

    it("devrait mettre à jour un employé existant", async () => {
      // Arrange
      const employeeData = {
        id: 10,
        manager_id: 8,
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@test.com",
        status: "active",
      };

      const employee = new Employee(employeeData);
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      await employee.save();

      // Assert
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE employees"),
        expect.arrayContaining([
          employee.first_name,
          employee.last_name,
          employee.email,
          employee.status,
          employee.manager_id,
          employee.id,
        ])
      );
    });

    it("devrait gérer les erreurs lors de la création/mise à jour d'un employé", async () => {
      // Arrange
      const employeeData = {
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@test.com",
      };

      const employee = new Employee(employeeData);
      const dbError = new Error("Database error");
      db.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(employee.save()).rejects.toThrow(dbError);
    });
  });

  describe("findByManager()", () => {
    it("devrait trouver tous les employés d'un manager", async () => {
      // Arrange
      const managerId = 5;
      const mockEmployeesData = [
        {
          id: 1,
          first_name: "Jean",
          last_name: "Dupont",
          manager_id: managerId,
        },
        {
          id: 2,
          first_name: "Marie",
          last_name: "Martin",
          manager_id: managerId,
        },
      ];

      db.execute.mockResolvedValueOnce([mockEmployeesData]);

      // Act
      const results = await Employee.findByManager(managerId);

      // Assert
      expect(results.length).toBe(2);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE manager_id = ?"),
        [managerId]
      );
      expect(results[0]).toBeInstanceOf(Employee);
      expect(results[0].id).toBe(mockEmployeesData[0].id);
      expect(results[1].id).toBe(mockEmployeesData[1].id);
    });

    it("devrait retourner un tableau vide si aucun employé n'est trouvé pour le manager", async () => {
      // Arrange
      const managerId = 5;
      db.execute.mockResolvedValueOnce([[]]);

      // Act
      const results = await Employee.findByManager(managerId);

      // Assert
      expect(results).toEqual([]);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE manager_id = ?"),
        [managerId]
      );
    });

    it("devrait gérer les erreurs lors de la recherche par manager_id", async () => {
      // Arrange
      const managerId = 5;
      const dbError = new Error("Database error");
      db.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Employee.findByManager(managerId)).rejects.toThrow(dbError);
    });
  });

  describe("findById()", () => {
    it("devrait trouver un employé par son ID", async () => {
      // Arrange
      const id = 1;
      const managerId = 5;
      const mockEmployeeData = {
        id,
        first_name: "Jean",
        last_name: "Dupont",
        manager_id: managerId,
      };

      db.execute.mockResolvedValueOnce([[mockEmployeeData]]);

      // Act
      const result = await Employee.findById(id);

      // Assert
      expect(result).toBeInstanceOf(Employee);
      expect(result.id).toBe(id);
      expect(result.manager_id).toBe(managerId);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ?"),
        [id]
      );
    });

    it("devrait retourner null si l'employé n'existe pas", async () => {
      // Arrange
      const id = 999;
      db.execute.mockResolvedValueOnce([[]]);

      // Act
      const result = await Employee.findById(id);

      // Assert
      expect(result).toBeNull();
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ?"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la recherche par ID", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");
      db.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Employee.findById(id)).rejects.toThrow(dbError);
    });
  });

  describe("findByIdAndUpdate()", () => {
    it("devrait mettre à jour un employé existant", async () => {
      // Arrange
      const id = 1;
      const updateData = {
        first_name: "Jean Updated",
        last_name: "Dupont Updated",
      };

      const mockEmployeeData = {
        id,
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@test.com",
        manager_id: 5,
      };

      // Mock the findById method
      db.execute.mockResolvedValueOnce([[mockEmployeeData]]);

      // Mock the save method called within findByIdAndUpdate
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await Employee.findByIdAndUpdate(id, updateData);

      // Assert
      expect(result).toBeInstanceOf(Employee);
      expect(result.first_name).toBe(updateData.first_name);
      expect(result.last_name).toBe(updateData.last_name);
      expect(db.execute).toHaveBeenCalledTimes(2); // findById and then save
    });

    it("devrait retourner null si l'employé n'existe pas", async () => {
      // Arrange
      const id = 999;
      const updateData = { first_name: "Test" };
      db.execute.mockResolvedValueOnce([[]]);

      // Act
      const result = await Employee.findByIdAndUpdate(id, updateData);

      // Assert
      expect(result).toBeNull();
    });

    it("devrait lancer une erreur si l'ID n'est pas valide", async () => {
      // Arrange
      const id = null;
      const updateData = { first_name: "Test" };

      // Act & Assert
      await expect(Employee.findByIdAndUpdate(id, updateData)).rejects.toThrow(
        "ID d'employé non valide"
      );
    });
  });

  describe("delete()", () => {
    it("devrait supprimer un employé", async () => {
      // Arrange
      const id = 1;
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await Employee.delete(id);

      // Assert
      expect(result).toBe(true);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM employees WHERE id = ?"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la suppression", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");
      db.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Employee.delete(id)).rejects.toThrow(dbError);
    });
  });

  describe("updateHourBalance()", () => {
    it("devrait mettre à jour le solde d'heures d'un employé", async () => {
      // Arrange
      const employeeId = 1;
      const mockBalanceResult = [{ total_balance: 10.5 }];

      // Mock for the SELECT query
      db.execute.mockResolvedValueOnce([mockBalanceResult]);

      // Mock for the UPDATE query
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await Employee.updateHourBalance(employeeId);

      // Assert
      expect(result).toBe(10.5);
      expect(db.execute).toHaveBeenCalledTimes(2);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT SUM(balance)"),
        [employeeId]
      );
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE employees SET hour_balance"),
        [10.5, employeeId]
      );
    });

    it("devrait retourner 0 si aucun solde n'est trouvé", async () => {
      // Arrange
      const employeeId = 1;

      // Mock for the SELECT query with no results
      db.execute.mockResolvedValueOnce([[{ total_balance: null }]]);

      // Mock for the UPDATE query
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await Employee.updateHourBalance(employeeId);

      // Assert
      expect(result).toBe(0);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE employees SET hour_balance"),
        [0, employeeId]
      );
    });
  });
});
