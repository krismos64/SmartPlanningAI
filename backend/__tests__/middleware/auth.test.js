const jwt = require("jsonwebtoken");
const {
  auth,
  getCurrentAdminId,
  JWT_SECRET,
} = require("../../middleware/auth");
const User = require("../../models/User");

// Mock du module jsonwebtoken
jest.mock("jsonwebtoken");

// Mock du module User
jest.mock("../../models/User");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset les mocks
    jest.clearAllMocks();

    // Setup req, res, next pour chaque test
    req = {
      cookies: {},
      headers: {},
      user: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe("auth middleware", () => {
    it("devrait rejeter la requête si aucun token n'est fourni", async () => {
      // Act
      await auth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentification requise",
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait rejeter la requête si le token est invalide", async () => {
      // Arrange
      req.cookies.accessToken = "invalid_token";
      jwt.verify.mockImplementation(() => {
        throw new Error("Token invalide");
      });

      // Act
      await auth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("invalide"),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait rejeter la requête si le token est expiré", async () => {
      // Arrange
      req.cookies.accessToken = "expired_token";
      const tokenError = new Error("Token expiré");
      tokenError.name = "TokenExpiredError";
      jwt.verify.mockImplementation(() => {
        throw tokenError;
      });

      // Act
      await auth(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("expirée"),
          code: "TOKEN_EXPIRED",
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait rejeter la requête si l'utilisateur n'existe pas", async () => {
      // Arrange
      req.cookies.accessToken = "valid_token";
      jwt.verify.mockReturnValue({ userId: 999 });
      User.findById.mockResolvedValue(null);

      // Act
      await auth(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Utilisateur non trouvé",
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait autoriser la requête si le token et l'utilisateur sont valides", async () => {
      // Arrange
      req.cookies.accessToken = "valid_token";
      jwt.verify.mockReturnValue({
        userId: 1,
        jti: "jti_value",
        iat: 1234567890,
        exp: 9876543210,
      });
      User.findById.mockResolvedValue({
        id: 1,
        email: "admin@test.com",
        role: "admin",
        first_name: "Admin",
        last_name: "Test",
      });

      // Act
      await auth(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(req.user).toEqual(
        expect.objectContaining({
          id: 1,
          email: "admin@test.com",
          role: "admin",
        })
      );
      expect(req.userId).toBe(1);
      expect(req.tokenInfo).toEqual({
        jti: "jti_value",
        iat: 1234567890,
        exp: 9876543210,
      });
      expect(next).toHaveBeenCalled();
    });

    it("devrait autoriser la requête avec token dans l'en-tête Authorization", async () => {
      // Arrange
      req.headers.authorization = "Bearer valid_token";
      jwt.verify.mockReturnValue({ userId: 1 });
      User.findById.mockResolvedValue({
        id: 1,
        email: "admin@test.com",
        role: "admin",
        first_name: "Admin",
        last_name: "Test",
      });

      // Act
      await auth(req, res, next);

      // Assert
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("getCurrentAdminId", () => {
    it("devrait retourner null si req.user n'existe pas", () => {
      // Arrange
      const req = {};

      // Act
      const result = getCurrentAdminId(req);

      // Assert
      expect(result).toBeNull();
    });

    it("devrait retourner null si req.user.id n'existe pas", () => {
      // Arrange
      const req = { user: {} };

      // Act
      const result = getCurrentAdminId(req);

      // Assert
      expect(result).toBeNull();
    });

    it("devrait retourner l'ID admin si req.user.id existe", () => {
      // Arrange
      const req = { user: { id: 42 } };

      // Act
      const result = getCurrentAdminId(req);

      // Assert
      expect(result).toBe(42);
    });
  });
});
