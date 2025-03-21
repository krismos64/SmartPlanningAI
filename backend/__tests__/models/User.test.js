const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const connectDB = require("../../config/db");

// Mocks
jest.mock("bcryptjs");
jest.mock("../../config/db");

describe("User Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    it("devrait initialiser les propriétés correctement", () => {
      // Arrange & Act
      const userData = {
        id: 1,
        email: "admin@test.com",
        password: "password123",
        role: "admin",
        first_name: "Admin",
        last_name: "Test",
        company: "Test Company",
        phone: "1234567890",
        jobTitle: "Manager",
        created_at: "2023-01-01 12:00:00",
        updated_at: "2023-01-02 12:00:00",
      };

      const user = new User(userData);

      // Assert
      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
      expect(user.first_name).toBe(userData.first_name);
      expect(user.last_name).toBe(userData.last_name);
      expect(user.company).toBe(userData.company);
      expect(user.phone).toBe(userData.phone);
      expect(user.jobTitle).toBe(userData.jobTitle);
      expect(user.created_at).toBe(userData.created_at);
      expect(user.updated_at).toBe(userData.updated_at);
    });

    it('devrait définir le rôle par défaut à "admin" si non spécifié', () => {
      // Arrange & Act
      const userData = {
        email: "admin@test.com",
        password: "password123",
      };

      const user = new User(userData);

      // Assert
      expect(user.role).toBe("admin");
    });
  });

  describe("save()", () => {
    it("devrait créer un nouvel utilisateur avec succès", async () => {
      // Arrange
      const userData = {
        email: "admin@test.com",
        password: "password123",
        first_name: "Admin",
        last_name: "Test",
      };

      const user = new User(userData);
      const hashedPassword = "hashed_password123";
      const insertId = 5;

      bcrypt.genSalt.mockResolvedValueOnce("salt");
      bcrypt.hash.mockResolvedValueOnce(hashedPassword);

      const mockResult = [{ insertId }];
      connectDB.execute.mockResolvedValueOnce(mockResult);

      // Act
      const result = await user.save();

      // Assert
      expect(result.id).toBe(insertId);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.arrayContaining([
          user.email,
          hashedPassword,
          "admin", // Le rôle est toujours 'admin'
          user.first_name,
          user.last_name,
        ])
      );
    });

    it("devrait mettre à jour un utilisateur existant avec succès", async () => {
      // Arrange
      const userData = {
        id: 5,
        email: "admin@test.com",
        first_name: "Updated",
        last_name: "Admin",
        company: "New Company",
        phone: "9876543210",
        jobTitle: "CEO",
      };

      const user = new User(userData);
      const mockResult = [{ affectedRows: 1 }];
      connectDB.execute.mockResolvedValueOnce(mockResult);

      // Act
      const result = await user.save();

      // Assert
      expect(result).toBe(user);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET"),
        expect.arrayContaining([
          user.email,
          user.role,
          user.first_name,
          user.last_name,
          user.company,
          user.phone,
          user.jobTitle,
          expect.anything(), // profileImage
          user.id,
        ])
      );
      // On ne doit pas appeler hash si pas de nouveau mot de passe
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("devrait mettre à jour le mot de passe si fourni lors d'une mise à jour", async () => {
      // Arrange
      const userData = {
        id: 5,
        email: "admin@test.com",
        password: "new_password", // Nouveau mot de passe fourni
        first_name: "Updated",
        last_name: "Admin",
      };

      const user = new User(userData);
      const hashedPassword = "new_hashed_password";

      bcrypt.genSalt.mockResolvedValueOnce("salt");
      bcrypt.hash.mockResolvedValueOnce(hashedPassword);

      const mockResult = [{ affectedRows: 1 }];
      connectDB.execute.mockResolvedValueOnce(mockResult);

      // Act
      const result = await user.save();

      // Assert
      expect(result).toBe(user);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET"),
        expect.arrayContaining([
          user.email,
          hashedPassword, // Le mot de passe hashé est utilisé
          user.role,
          user.first_name,
          user.last_name,
        ])
      );
    });

    it("devrait gérer les erreurs lors de la création/mise à jour d'un utilisateur", async () => {
      // Arrange
      const user = new User({
        email: "admin@test.com",
        password: "password123",
      });

      const dbError = new Error("Database error");

      bcrypt.genSalt.mockResolvedValueOnce("salt");
      bcrypt.hash.mockResolvedValueOnce("hashed_password");
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(user.save()).rejects.toThrow(dbError);
    });
  });

  describe("create()", () => {
    it("devrait créer un nouvel utilisateur via la méthode statique create", async () => {
      // Arrange
      const userData = {
        email: "admin@test.com",
        password: "password123",
        first_name: "Admin",
        last_name: "Test",
      };

      const hashedPassword = "hashed_password123";
      const insertId = 5;

      bcrypt.genSalt.mockResolvedValueOnce("salt");
      bcrypt.hash.mockResolvedValueOnce(hashedPassword);

      const mockResult = [{ insertId }];
      connectDB.execute.mockResolvedValueOnce(mockResult);

      // Act
      const result = await User.create(userData);

      // Assert
      expect(result.id).toBe(insertId);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.arrayContaining([
          userData.email,
          hashedPassword,
          "admin", // Le rôle est toujours 'admin'
          userData.first_name,
          userData.last_name,
        ])
      );
    });
  });

  describe("findByEmail()", () => {
    it("devrait trouver un utilisateur par son email", async () => {
      // Arrange
      const email = "admin@test.com";
      const mockUser = {
        id: 1,
        email,
        role: "admin",
        first_name: "Admin",
        last_name: "Test",
      };

      // Mock pour connectDB.query (pour la vérification de la base de données)
      connectDB.query.mockResolvedValueOnce([[{ db: "testdb" }]]);

      // Mock pour connectDB.execute
      connectDB.execute.mockResolvedValueOnce([[mockUser]]);

      // Act
      const result = await User.findByEmail(email);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.role).toBe(mockUser.role);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM users WHERE email = ?"),
        [email]
      );
    });

    it("devrait retourner null si aucun utilisateur n'est trouvé", async () => {
      // Arrange
      const email = "nonexistent@test.com";

      // Mock pour connectDB.query (pour la vérification de la base de données)
      connectDB.query.mockResolvedValueOnce([[{ db: "testdb" }]]);

      // Mock pour connectDB.execute
      connectDB.execute.mockResolvedValueOnce([[]]);

      // Act
      const result = await User.findByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM users WHERE email = ?"),
        [email]
      );
    });

    it("devrait gérer les erreurs lors de la recherche par email", async () => {
      // Arrange
      const email = "admin@test.com";
      const dbError = new Error("Database error");

      // Mock pour connectDB.query (pour la vérification de la base de données)
      connectDB.query.mockResolvedValueOnce([[{ db: "testdb" }]]);

      // Mock pour connectDB.execute qui échoue
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(User.findByEmail(email)).rejects.toThrow(dbError);
    });
  });

  describe("findById()", () => {
    it("devrait trouver un utilisateur par son ID", async () => {
      // Arrange
      const id = 1;
      const mockUser = {
        id,
        email: "admin@test.com",
        role: "admin",
        first_name: "Admin",
        last_name: "Test",
      };

      connectDB.execute.mockResolvedValueOnce([[mockUser]]);

      // Act
      const result = await User.findById(id);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.role).toBe(mockUser.role);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [id]
      );
    });

    it("devrait retourner null si aucun utilisateur n'est trouvé", async () => {
      // Arrange
      const id = 999;

      connectDB.execute.mockResolvedValueOnce([[]]);

      // Act
      const result = await User.findById(id);

      // Assert
      expect(result).toBeNull();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la recherche par ID", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");

      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(User.findById(id)).rejects.toThrow(dbError);
    });
  });

  describe("comparePassword()", () => {
    it("devrait comparer le mot de passe correctement", async () => {
      // Arrange
      const plainPassword = "password";
      const hashedPassword = "hashed_password";
      const user = new User({
        id: 1,
        email: "admin@test.com",
        password: hashedPassword,
      });

      bcrypt.compare.mockResolvedValueOnce(true);

      // Act
      const result = await user.comparePassword(plainPassword);

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword
      );
    });

    it("devrait retourner false si les mots de passe ne correspondent pas", async () => {
      // Arrange
      const plainPassword = "wrong_password";
      const hashedPassword = "hashed_password";
      const user = new User({
        id: 1,
        email: "admin@test.com",
        password: hashedPassword,
      });

      bcrypt.compare.mockResolvedValueOnce(false);

      // Act
      const result = await user.comparePassword(plainPassword);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword
      );
    });

    it("devrait retourner false si le mot de passe candidat est manquant", async () => {
      // Arrange
      const user = new User({
        id: 1,
        email: "admin@test.com",
        password: "hashed_password",
      });

      // Act
      const result = await user.comparePassword(null);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("devrait retourner false si le mot de passe haché est manquant", async () => {
      // Arrange
      const user = new User({
        id: 1,
        email: "admin@test.com",
        password: null,
      });

      // Act
      const result = await user.comparePassword("password123");

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe("find()", () => {
    it("devrait récupérer tous les utilisateurs", async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          email: "admin1@test.com",
          role: "admin",
          first_name: "Admin",
          last_name: "One",
        },
        {
          id: 2,
          email: "admin2@test.com",
          role: "admin",
          first_name: "Admin",
          last_name: "Two",
        },
      ];

      connectDB.execute.mockResolvedValueOnce([mockUsers]);

      // Act
      const results = await User.find();

      // Assert
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0]).toBeInstanceOf(User);
      expect(results[1]).toBeInstanceOf(User);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT")
      );
    });

    it("devrait gérer les erreurs lors de la récupération des utilisateurs", async () => {
      // Arrange
      const dbError = new Error("Database error");
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(User.find()).rejects.toThrow(dbError);
    });
  });

  describe("findByIdAndUpdate()", () => {
    it("devrait mettre à jour un utilisateur par son ID", async () => {
      // Arrange
      const id = 1;
      const updateData = {
        first_name: "Updated",
        last_name: "Name",
      };

      const existingUser = new User({
        id,
        email: "admin@test.com",
        role: "admin",
        first_name: "Admin",
        last_name: "User",
      });

      // Mock pour findById
      jest.spyOn(User, "findById").mockResolvedValueOnce(existingUser);

      // Mock pour la méthode save
      jest.spyOn(existingUser, "save").mockResolvedValueOnce({
        ...existingUser,
        ...updateData,
      });

      // Act
      const result = await User.findByIdAndUpdate(id, updateData);

      // Assert
      expect(result.first_name).toBe(updateData.first_name);
      expect(result.last_name).toBe(updateData.last_name);
      expect(User.findById).toHaveBeenCalledWith(id);
      expect(existingUser.save).toHaveBeenCalled();
    });

    it("devrait retourner null si l'utilisateur n'existe pas", async () => {
      // Arrange
      const id = 999;
      const updateData = {
        first_name: "Updated",
      };

      // Mock pour findById qui ne trouve pas l'utilisateur
      jest.spyOn(User, "findById").mockResolvedValueOnce(null);

      // Act
      const result = await User.findByIdAndUpdate(id, updateData);

      // Assert
      expect(result).toBeNull();
      expect(User.findById).toHaveBeenCalledWith(id);
    });

    it("devrait gérer les erreurs lors de la mise à jour", async () => {
      // Arrange
      const id = 1;
      const updateData = {
        first_name: "Updated",
      };
      const dbError = new Error("Database error");

      jest.spyOn(User, "findById").mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(User.findByIdAndUpdate(id, updateData)).rejects.toThrow(
        dbError
      );
    });
  });

  describe("delete()", () => {
    it("devrait supprimer un utilisateur par son ID", async () => {
      // Arrange
      const id = 1;
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await User.delete(id);

      // Assert
      expect(result).toBe(true);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM users"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la suppression", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(User.delete(id)).rejects.toThrow(dbError);
    });
  });
});
