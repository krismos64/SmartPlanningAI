const Department = require("../../models/Department");
const connectDB = require("../../config/db");

// Mocks
jest.mock("../../config/db", () => ({
  execute: jest.fn(),
  query: jest.fn(),
}));

describe("Department Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    it("devrait initialiser les propriétés correctement", () => {
      // Arrange & Act
      const departmentData = {
        id: 1,
        name: "IT",
        description: "Information Technology Department",
        manager_id: 5,
        created_at: "2022-01-15 10:00:00",
        updated_at: "2022-02-20 15:30:00",
      };

      const department = new Department(departmentData);

      // Assert
      expect(department.id).toBe(departmentData.id);
      expect(department.name).toBe(departmentData.name);
      expect(department.description).toBe(departmentData.description);
      expect(department.manager_id).toBe(departmentData.manager_id);
      expect(department.created_at).toBe(departmentData.created_at);
      expect(department.updated_at).toBe(departmentData.updated_at);
    });

    it("devrait initialiser les valeurs par défaut si aucune donnée n'est fournie", () => {
      // Arrange & Act
      const department = new Department();

      // Assert
      expect(department.id).toBeUndefined();
      expect(department.name).toBeNull();
      expect(department.description).toBeNull();
      expect(department.manager_id).toBeNull();
      expect(department.created_at).toBeInstanceOf(Date);
      expect(department.updated_at).toBeInstanceOf(Date);
    });
  });

  describe("find()", () => {
    it("devrait récupérer tous les départements de la table departments", async () => {
      // Arrange
      const mockDepartments = [
        {
          id: 1,
          name: "IT",
          description: "Information Technology Department",
          manager_id: 5,
        },
        {
          id: 2,
          name: "HR",
          description: "Human Resources Department",
          manager_id: 6,
        },
      ];

      // Vérifier si la table departments existe (retourne des résultats)
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Récupérer les départements
      connectDB.query.mockResolvedValueOnce([mockDepartments]);

      // Act
      const departments = await Department.find();

      // Assert
      expect(departments.length).toBe(2);
      expect(departments[0]).toBeInstanceOf(Department);
      expect(departments[0].id).toBe(mockDepartments[0].id);
      expect(departments[0].name).toBe(mockDepartments[0].name);
      expect(departments[1]).toBeInstanceOf(Department);
      expect(departments[1].id).toBe(mockDepartments[1].id);
    });

    it("devrait extraire les départements des employés si la table departments n'existe pas", async () => {
      // Arrange
      const mockEmployeeDepartments = [
        { department: "IT" },
        { department: "HR" },
      ];

      // Vérifier si la table departments existe (retourne vide = table n'existe pas)
      connectDB.query.mockResolvedValueOnce([[]]);

      // Récupérer les départements uniques des employés
      connectDB.query.mockResolvedValueOnce([mockEmployeeDepartments]);

      // Act
      const departments = await Department.find();

      // Assert
      expect(departments.length).toBe(2);
      expect(departments[0]).toBeInstanceOf(Department);
      expect(departments[0].name).toBe(mockEmployeeDepartments[0].department);
      expect(departments[1]).toBeInstanceOf(Department);
      expect(departments[1].name).toBe(mockEmployeeDepartments[1].department);
    });

    it("devrait gérer les erreurs lors de la récupération des départements", async () => {
      // Arrange
      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Department.find()).rejects.toThrow(dbError);
    });
  });

  describe("findById()", () => {
    it("devrait récupérer un département par son ID", async () => {
      // Arrange
      const id = 1;
      const mockDepartment = {
        id,
        name: "IT",
        description: "Information Technology Department",
        manager_id: 5,
      };

      // Mock pour les tables
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Mock pour la recherche du département
      connectDB.query.mockResolvedValueOnce([[mockDepartment]]);

      // Act
      const department = await Department.findById(id);

      // Assert
      expect(department).toBeInstanceOf(Department);
      expect(department.id).toBe(id);
      expect(department.name).toBe(mockDepartment.name);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ?"),
        [id]
      );
    });

    it("devrait retourner null si aucun département n'est trouvé avec l'ID spécifié", async () => {
      // Arrange
      const id = 999;

      // Mock pour les tables
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Mock pour la recherche du département (pas trouvé)
      connectDB.query.mockResolvedValueOnce([[]]);

      // Act
      const department = await Department.findById(id);

      // Assert
      expect(department).toBeNull();
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ?"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la recherche par ID", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Department.findById(id)).rejects.toThrow(dbError);
    });
  });

  describe("findByName()", () => {
    it("devrait récupérer un département par son nom", async () => {
      // Arrange
      const name = "IT";
      const mockDepartment = {
        id: 1,
        name,
        description: "Information Technology Department",
        manager_id: 5,
      };

      // Mock pour les tables
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Mock pour la recherche du département
      connectDB.query.mockResolvedValueOnce([[mockDepartment]]);

      // Act
      const department = await Department.findByName(name);

      // Assert
      expect(department).toBeInstanceOf(Department);
      expect(department.name).toBe(name);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE name = ?"),
        [name]
      );
    });

    it("devrait retourner null si aucun département n'est trouvé avec le nom spécifié", async () => {
      // Arrange
      const name = "NonExistentDepartment";

      // Mock pour les tables
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Mock pour la recherche du département (pas trouvé)
      connectDB.query.mockResolvedValueOnce([[]]);

      // Act
      const department = await Department.findByName(name);

      // Assert
      expect(department).toBeNull();
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE name = ?"),
        [name]
      );
    });

    it("devrait gérer les erreurs lors de la recherche par nom", async () => {
      // Arrange
      const name = "IT";
      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Department.findByName(name)).rejects.toThrow(dbError);
    });
  });

  describe("getEmployees()", () => {
    it("devrait récupérer tous les employés d'un département", async () => {
      // Arrange
      const departmentId = 1;
      const mockDepartment = {
        id: departmentId,
        name: "IT",
        description: "Information Technology Department",
      };

      const mockEmployees = [
        {
          id: 1,
          first_name: "Jean",
          last_name: "Dupont",
          department: departmentId,
        },
        {
          id: 2,
          first_name: "Marie",
          last_name: "Martin",
          department: departmentId,
        },
      ];

      // Mock pour findById
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);
      connectDB.query.mockResolvedValueOnce([[mockDepartment]]);

      // Mock pour la requête qui récupère les employés
      connectDB.query.mockResolvedValueOnce([mockEmployees]);

      // Act
      const employees = await Department.getEmployees(departmentId);

      // Assert
      expect(employees.length).toBe(2);
      expect(employees[0].id).toBe(mockEmployees[0].id);
      expect(employees[1].id).toBe(mockEmployees[1].id);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE department = ?"),
        [departmentId]
      );
    });

    it("devrait retourner un tableau vide si aucun employé n'est trouvé pour ce département", async () => {
      // Arrange
      const departmentId = 999;
      const mockDepartment = {
        id: departmentId,
        name: "Test",
        description: "Test Department",
      };

      // Mock pour findById
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);
      connectDB.query.mockResolvedValueOnce([[mockDepartment]]);

      // Mock pour la requête qui ne trouve pas d'employés
      connectDB.query.mockResolvedValueOnce([[]]);

      // Act
      const employees = await Department.getEmployees(departmentId);

      // Assert
      expect(employees).toEqual([]);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE department = ?"),
        [departmentId]
      );
    });

    it("devrait gérer les erreurs lors de la récupération des employés", async () => {
      // Arrange
      const departmentId = 1;
      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Department.getEmployees(departmentId)).rejects.toThrow(
        dbError
      );
    });
  });

  describe("save()", () => {
    it("devrait créer un nouveau département avec un manager_id", async () => {
      // Arrange
      const departmentData = {
        name: "IT",
        description: "Information Technology Department",
        manager_id: 5,
      };

      const department = new Department(departmentData);
      const insertId = 10;

      // Premier mock pour vérifier si la table existe
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Deuxième mock pour l'insertion
      connectDB.query.mockResolvedValueOnce([{ insertId }]);

      // Act
      const result = await department.save();

      // Assert
      expect(result.id).toBe(insertId);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO departments"),
        expect.arrayContaining([
          department.name,
          department.description,
          department.manager_id,
        ])
      );
    });

    it("devrait créer la table departments si elle n'existe pas", async () => {
      // Arrange
      const departmentData = {
        name: "IT",
        description: "Information Technology Department",
      };

      const department = new Department(departmentData);
      const insertId = 10;

      // Premier mock pour vérifier si la table existe
      connectDB.query.mockResolvedValueOnce([[]]);

      // Deuxième mock pour créer la table
      connectDB.query.mockResolvedValueOnce([]);

      // Troisième mock pour l'insertion
      connectDB.query.mockResolvedValueOnce([{ insertId }]);

      // Act
      const result = await department.save();

      // Assert
      expect(result.id).toBe(insertId);
      expect(connectDB.query).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/CREATE TABLE.*departments/)
      );
    });

    it("devrait mettre à jour un département existant", async () => {
      // Arrange
      const departmentData = {
        id: 10,
        name: "IT",
        description: "Updated Description",
        manager_id: 8,
      };

      const department = new Department(departmentData);

      // Premier mock pour vérifier si la table existe
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Deuxième mock pour la mise à jour
      connectDB.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await department.save();

      // Assert
      expect(result).toBe(department);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE departments SET"),
        expect.arrayContaining([
          department.name,
          department.description,
          department.manager_id,
          department.id,
        ])
      );
    });

    it("devrait gérer les erreurs lors de la sauvegarde", async () => {
      // Arrange
      const department = new Department({
        name: "IT",
        description: "Information Technology Department",
      });

      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(department.save()).rejects.toThrow(dbError);
    });
  });

  describe("update()", () => {
    it("devrait mettre à jour un département existant avec les nouvelles données", async () => {
      // Arrange
      const id = 1;
      const updateData = {
        name: "Updated IT",
        description: "Updated Description",
        manager_id: 10,
      };

      const mockDepartment = {
        id,
        name: "IT",
        description: "Information Technology Department",
        manager_id: 5,
      };

      // Mock pour findById
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);
      connectDB.query.mockResolvedValueOnce([[mockDepartment]]);

      // Mock pour la table lors de save()
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);

      // Mock pour la mise à jour
      connectDB.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await Department.update(id, updateData);

      // Assert
      expect(result).toBeInstanceOf(Department);
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
      expect(result.manager_id).toBe(updateData.manager_id);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE departments SET"),
        expect.arrayContaining([
          updateData.name,
          updateData.description,
          updateData.manager_id,
          id,
        ])
      );
    });

    it("devrait retourner null si le département n'existe pas", async () => {
      // Arrange
      const id = 999;
      const updateData = {
        name: "Updated IT",
      };

      // Mock pour findById (aucun résultat)
      connectDB.query.mockResolvedValueOnce([
        [{ Tables_in_db: "departments" }],
      ]);
      connectDB.query.mockResolvedValueOnce([[]]);

      // Act
      const result = await Department.update(id, updateData);

      // Assert
      expect(result).toBeNull();
    });

    it("devrait gérer les erreurs lors de la mise à jour", async () => {
      // Arrange
      const id = 1;
      const updateData = {
        name: "Updated IT",
      };

      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Department.update(id, updateData)).rejects.toThrow(dbError);
    });
  });

  describe("delete()", () => {
    it("devrait supprimer un département", async () => {
      // Arrange
      const id = 1;
      connectDB.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await Department.delete(id);

      // Assert
      expect(result).toBe(true);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM departments WHERE id = ?"),
        [id]
      );
    });

    it("devrait retourner false si aucun département n'a été supprimé", async () => {
      // Arrange
      const id = 999;
      connectDB.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      // Act
      const result = await Department.delete(id);

      // Assert
      expect(result).toBe(false);
      expect(connectDB.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM departments WHERE id = ?"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la suppression", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");
      connectDB.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(Department.delete(id)).rejects.toThrow(dbError);
    });
  });
});
