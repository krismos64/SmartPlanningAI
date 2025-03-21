describe("Configuration des tests", () => {
  it("devrait correctement charger les mocks", () => {
    // Vérifier que les mocks de base de données sont disponibles
    expect(require("../config/db")).toBeDefined();

    // Vérifie que les mocks des modèles sont disponibles
    const {
      mockUser,
      mockEmployee,
      mockVacationRequest,
      mockActivity,
      mockNotification,
    } = require("./mocks/models");
    expect(mockUser).toBeDefined();
    expect(mockEmployee).toBeDefined();
    expect(mockVacationRequest).toBeDefined();
    expect(mockActivity).toBeDefined();
    expect(mockNotification).toBeDefined();
  });

  it("devrait avoir accès aux variables globales de test", () => {
    // Vérifier que les variables globales sont définies
    expect(global.testUsers).toBeDefined();
    expect(global.testUsers.admin1).toBeDefined();

    expect(global.testEmployees).toBeDefined();
    expect(global.testEmployees.employee1).toBeDefined();

    expect(global.testVacationRequests).toBeDefined();
    expect(global.testVacationRequests.vacation1).toBeDefined();

    expect(global.createMockRequestResponse).toBeDefined();
  });

  it("devrait pouvoir créer des mocks de requête et réponse", () => {
    // Tester la fonction createMockRequestResponse
    const { req, res, next } = global.createMockRequestResponse();

    // Vérifier que req a les propriétés attendues
    expect(req.user).toBeDefined();
    expect(req.params).toBeDefined();
    expect(req.body).toBeDefined();
    expect(req.query).toBeDefined();
    expect(req.cookies).toBeDefined();
    expect(req.headers).toBeDefined();

    // Vérifier que res a les méthodes attendues
    expect(res.status).toBeDefined();
    expect(res.json).toBeDefined();
    expect(res.send).toBeDefined();
    expect(res.cookie).toBeDefined();

    // Vérifier que next est une fonction
    expect(typeof next).toBe("function");
  });
});
