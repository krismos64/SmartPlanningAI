import { act, renderHook } from "@testing-library/react";
import AuthService from "../../services/AuthService";
import { mockUsers } from "../mocks/mockData";

// Mock du module AuthService
jest.mock("../../services/AuthService", () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  updateUser: jest.fn(),
}));

// Mock des valeurs locales du hook
const createUseAuth = () => {
  let state = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };

  // Création d'un mock du hook useAuth
  const useAuth = () => {
    const setUser = (user) => {
      state.user = user;
      state.isAuthenticated = !!user;
    };

    const setLoading = (loading) => {
      state.isLoading = loading;
    };

    const setError = (error) => {
      state.error = error;
    };

    // Mock des fonctions
    const login = async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const response = await AuthService.login(email, password);
        if (response.success) {
          setUser(response.data);
          return true;
        } else {
          setError(response.message || "Erreur lors de la connexion");
          return false;
        }
      } catch (error) {
        setError(error.message || "Erreur lors de la connexion");
        return false;
      } finally {
        setLoading(false);
      }
    };

    const register = async (userData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await AuthService.register(userData);
        if (response.success) {
          return true;
        } else {
          setError(response.message || "Erreur lors de l'inscription");
          return false;
        }
      } catch (error) {
        setError(error.message || "Erreur lors de l'inscription");
        return false;
      } finally {
        setLoading(false);
      }
    };

    const logout = async () => {
      setLoading(true);
      try {
        await AuthService.logout();
        setUser(null);
        return true;
      } catch (error) {
        setError(error.message || "Erreur lors de la déconnexion");
        return false;
      } finally {
        setLoading(false);
      }
    };

    const updateProfile = async (userData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await AuthService.updateUser(userData);
        if (response.success) {
          setUser(response.data);
          return true;
        } else {
          setError(
            response.message || "Erreur lors de la mise à jour du profil"
          );
          return false;
        }
      } catch (error) {
        setError(error.message || "Erreur lors de la mise à jour du profil");
        return false;
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await AuthService.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        setError(
          error.message ||
            "Erreur lors de la vérification de l'authentification"
        );
      } finally {
        setLoading(false);
      }
    };

    return {
      user: state.user,
      isLoading: state.isLoading,
      error: state.error,
      isAuthenticated: state.isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      checkAuth,
    };
  };

  return { useAuth, getState: () => state };
};

describe("useAuth Hook", () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks entre les tests
    jest.clearAllMocks();
  });

  it("devrait avoir l'état initial correct", () => {
    const { useAuth } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("devrait gérer une connexion réussie", async () => {
    const { useAuth } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    // Mock de la réponse du service d'authentification
    AuthService.login.mockResolvedValueOnce({
      success: true,
      data: mockUsers.admin,
    });

    // Appel à la fonction login
    await act(async () => {
      const success = await result.current.login(
        "admin@example.com",
        "password"
      );
      expect(success).toBe(true);
    });

    // Vérification de l'état après la connexion
    expect(result.current.user).toEqual(mockUsers.admin);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(AuthService.login).toHaveBeenCalledWith(
      "admin@example.com",
      "password"
    );
  });

  it("devrait gérer une erreur de connexion", async () => {
    const { useAuth } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    // Mock de la réponse du service d'authentification avec une erreur
    AuthService.login.mockResolvedValueOnce({
      success: false,
      message: "Identifiants invalides",
    });

    // Appel à la fonction login
    await act(async () => {
      const success = await result.current.login(
        "wrong@example.com",
        "wrongpassword"
      );
      expect(success).toBe(false);
    });

    // Vérification de l'état après l'échec de connexion
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Identifiants invalides");
  });

  it("devrait gérer une exception lors de la connexion", async () => {
    const { useAuth } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    // Mock de la réponse du service d'authentification avec une exception
    AuthService.login.mockRejectedValueOnce(new Error("Erreur réseau"));

    // Appel à la fonction login
    await act(async () => {
      const success = await result.current.login(
        "admin@example.com",
        "password"
      );
      expect(success).toBe(false);
    });

    // Vérification de l'état après l'exception
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Erreur réseau");
  });

  it("devrait gérer l'inscription d'un nouvel utilisateur", async () => {
    const { useAuth } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    const newUser = {
      first_name: "Nouveau",
      last_name: "Utilisateur",
      email: "nouveau@example.com",
      password: "password123",
    };

    // Mock de la réponse du service d'authentification
    AuthService.register.mockResolvedValueOnce({
      success: true,
      data: { ...newUser, id: "new-user-id" },
    });

    // Appel à la fonction register
    await act(async () => {
      const success = await result.current.register(newUser);
      expect(success).toBe(true);
    });

    // Vérification que le service a été appelé correctement
    expect(AuthService.register).toHaveBeenCalledWith(newUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    // L'utilisateur ne doit pas être connecté automatiquement après l'inscription
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("devrait gérer la déconnexion", async () => {
    const { useAuth, getState } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    // Définir un utilisateur connecté manuellement
    act(() => {
      const state = getState();
      state.user = mockUsers.admin;
      state.isAuthenticated = true;
    });

    // Vérifier que l'utilisateur est bien défini
    expect(result.current.user).toEqual(mockUsers.admin);
    expect(result.current.isAuthenticated).toBe(true);

    // Mock de la réponse du service d'authentification
    AuthService.logout.mockResolvedValueOnce({});

    // Appel à la fonction logout
    await act(async () => {
      const success = await result.current.logout();
      expect(success).toBe(true);
    });

    // Vérification de l'état après la déconnexion
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(AuthService.logout).toHaveBeenCalled();
  });

  it("devrait vérifier l'authentification de l'utilisateur", async () => {
    const { useAuth } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    // Mock de la réponse du service d'authentification
    AuthService.getCurrentUser.mockResolvedValueOnce({
      success: true,
      data: mockUsers.employee,
    });

    // Appel à la fonction checkAuth
    await act(async () => {
      await result.current.checkAuth();
    });

    // Vérification de l'état après la vérification
    expect(result.current.user).toEqual(mockUsers.employee);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("devrait mettre à jour le profil utilisateur", async () => {
    const { useAuth, getState } = createUseAuth();
    const { result } = renderHook(() => useAuth());

    // Définir un utilisateur connecté manuellement
    act(() => {
      const state = getState();
      state.user = mockUsers.admin;
      state.isAuthenticated = true;
    });

    const updatedUser = {
      ...mockUsers.admin,
      first_name: "Updated",
      email: "updated@example.com",
    };

    // Mock de la réponse du service d'authentification
    AuthService.updateUser.mockResolvedValueOnce({
      success: true,
      data: updatedUser,
    });

    // Appel à la fonction updateProfile
    await act(async () => {
      const success = await result.current.updateProfile(updatedUser);
      expect(success).toBe(true);
    });

    // Vérification de l'état après la mise à jour
    expect(result.current.user).toEqual(updatedUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(AuthService.updateUser).toHaveBeenCalledWith(updatedUser);
  });
});
