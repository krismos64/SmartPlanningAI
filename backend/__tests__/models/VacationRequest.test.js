const VacationRequest = require("../../models/VacationRequest");
const connectDB = require("../../config/db");

// Mocks
jest.mock("../../config/db");

describe("VacationRequest Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Supprimer les logs pour les tests
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Constructor", () => {
    it("devrait initialiser les propriétés correctement", () => {
      // Arrange & Act
      const requestData = {
        id: 1,
        employee_id: 5,
        employee_name: "John Doe",
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
        duration: 7,
        status: "pending",
        reason: "Congés d'été",
        approved_by: "10",
        approved_at: "2023-07-01 10:00:00",
        rejected_by: null,
        rejected_at: null,
        attachment: null,
        quota_exceeded: false,
        created_at: "2023-06-20 10:00:00",
        updated_at: "2023-06-20 10:00:00",
      };

      const vacationRequest = new VacationRequest(requestData);

      // Assert
      expect(vacationRequest.id).toBe(requestData.id);
      expect(vacationRequest.employee_id).toBe(requestData.employee_id);
      expect(vacationRequest.employee_name).toBe(requestData.employee_name);
      expect(vacationRequest.type).toBe(requestData.type);
      expect(vacationRequest.start_date).toBe(requestData.start_date);
      expect(vacationRequest.end_date).toBe(requestData.end_date);
      expect(vacationRequest.duration).toBe(requestData.duration);
      expect(vacationRequest.status).toBe(requestData.status);
      expect(vacationRequest.reason).toBe(requestData.reason);
      expect(vacationRequest.approved_by).toBe(10); // Converti en INT
      expect(vacationRequest.approved_at).toBe(requestData.approved_at);
      expect(vacationRequest.rejected_by).toBe(requestData.rejected_by);
      expect(vacationRequest.rejected_at).toBe(requestData.rejected_at);
      expect(vacationRequest.attachment).toBe(requestData.attachment);
      expect(vacationRequest.quota_exceeded).toBe(requestData.quota_exceeded);
      expect(vacationRequest.created_at).toBe(requestData.created_at);
      expect(vacationRequest.updated_at).toBe(requestData.updated_at);
    });

    it("devrait initialiser les valeurs par défaut", () => {
      // Arrange & Act
      const requestData = {
        employee_id: 5,
        start_date: "2023-07-15",
        end_date: "2023-07-25",
      };

      const vacationRequest = new VacationRequest(requestData);

      // Assert
      expect(vacationRequest.type).toBe("paid");
      expect(vacationRequest.status).toBe("pending");
      expect(vacationRequest.quota_exceeded).toBe(false);
      expect(vacationRequest.approved_by).toBeNull();
      expect(vacationRequest.rejected_by).toBeNull();
    });
  });

  describe("save()", () => {
    it("devrait créer une nouvelle demande de congés", async () => {
      // Arrange
      const requestData = {
        employee_id: 5,
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
        duration: 7,
        status: "pending",
        reason: "Congés d'été",
      };

      const request = new VacationRequest(requestData);
      const insertId = 10;

      // Mock pour l'insertion
      connectDB.execute.mockResolvedValueOnce([{ insertId }]);

      // Act
      const result = await request.save();

      // Assert
      expect(result.id).toBe(insertId);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO vacation_requests"),
        expect.arrayContaining([
          5, // employeeId (converti en nombre)
          request.type,
          request.start_date,
          request.end_date,
          expect.any(Number), // duration
          request.reason,
          request.status,
        ])
      );
    });

    it("devrait mettre à jour une demande existante avec approved_by", async () => {
      // Arrange
      const requestData = {
        id: 10,
        employee_id: 5,
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
        duration: 7,
        status: "approved",
        reason: "Congés d'été",
        approved_by: 8, // ID de l'admin qui a approuvé
        approved_at: "2023-07-01 10:00:00",
        rejected_by: null,
        rejected_at: null,
      };

      const request = new VacationRequest(requestData);

      // Mock pour la mise à jour
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await request.save();

      // Assert
      expect(result).toBe(request);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE vacation_requests.*SET.*WHERE id = \?/s),
        expect.arrayContaining([
          5, // employeeId (converti en nombre)
          request.type,
          request.start_date,
          request.end_date,
          request.duration,
          request.reason,
          request.status,
          request.approved_by,
          expect.any(Object), // approved_at (Date ou null)
          request.rejected_by,
          expect.any(Object), // rejected_at (Date ou null)
          request.id,
        ])
      );
    });

    it("devrait mettre à jour une demande existante avec rejected_by et rejection_reason", async () => {
      // Arrange
      const requestData = {
        id: 10,
        employee_id: 5,
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
        duration: 7,
        status: "rejected",
        reason: "Congés d'été",
        approved_by: null,
        approved_at: null,
        rejected_by: 8, // ID de l'admin qui a rejeté
        rejected_at: "2023-07-01 10:00:00",
        rejection_reason: "Période chargée",
      };

      const request = new VacationRequest(requestData);

      // Mock pour la mise à jour
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await request.save();

      // Assert
      expect(result).toBe(request);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE vacation_requests.*SET.*WHERE id = \?/s),
        expect.arrayContaining([
          5, // employeeId (converti en nombre)
          request.type,
          request.start_date,
          request.end_date,
          request.duration,
          request.reason,
          request.status,
          request.approved_by,
          expect.any(Object), // approved_at (Date ou null)
          request.rejected_by,
          expect.any(Object), // rejected_at (Date ou null)
          request.rejection_reason,
          request.id,
        ])
      );
    });

    it("devrait gérer les erreurs lors de la création/mise à jour", async () => {
      // Arrange
      const requestData = {
        employee_id: 5,
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
      };

      const request = new VacationRequest(requestData);
      const dbError = new Error("Database error");

      // Mock pour l'erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(request.save()).rejects.toThrow(dbError);
    });
  });

  describe("find()", () => {
    it("devrait trouver toutes les demandes de congés", async () => {
      // Arrange
      const mockRequests = [
        {
          id: 1,
          employee_id: 5,
          employee_name: "John Doe",
          status: "approved",
          approved_by: 8,
          approver_first_name: "Admin",
          approver_last_name: "User",
          rejected_by: null,
        },
        {
          id: 2,
          employee_id: 6,
          employee_name: "Jane Smith",
          status: "rejected",
          approved_by: null,
          rejected_by: 8,
          rejecter_first_name: "Admin",
          rejecter_last_name: "User",
        },
      ];

      // Mock pour la récupération
      connectDB.execute.mockResolvedValueOnce([mockRequests]);

      // Act
      const results = await VacationRequest.find();

      // Assert
      expect(results.length).toBe(2);
      expect(results[0]).toBeInstanceOf(VacationRequest);
      expect(results[0].id).toBe(mockRequests[0].id);
      expect(results[0].employee_name).toBe(mockRequests[0].employee_name);
      expect(results[0].approver_name).toBe("Admin User");
      expect(results[1]).toBeInstanceOf(VacationRequest);
      expect(results[1].id).toBe(mockRequests[1].id);
      expect(results[1].employee_name).toBe(mockRequests[1].employee_name);
      expect(results[1].rejecter_name).toBe("Admin User");
    });

    it("devrait gérer les erreurs lors de la récupération des demandes", async () => {
      // Arrange
      const dbError = new Error("Database error");

      // Mock pour la récupération avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(VacationRequest.find()).rejects.toThrow(dbError);
    });
  });

  describe("findById()", () => {
    it("devrait trouver une demande par son ID", async () => {
      // Arrange
      const id = 1;
      const mockRequest = {
        id,
        employee_id: 5,
        employee_name: "John Doe",
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
        status: "approved",
        approved_by: 8,
        approver_first_name: "Admin",
        approver_last_name: "User",
        rejected_by: null,
      };

      // Mock pour la récupération
      connectDB.execute.mockResolvedValueOnce([[mockRequest]]);

      // Act
      const result = await VacationRequest.findById(id);

      // Assert
      expect(result).toBeInstanceOf(VacationRequest);
      expect(result.id).toBe(id);
      expect(result.employee_id).toBe(mockRequest.employee_id);
      expect(result.employee_name).toBe(mockRequest.employee_name);
      expect(result.approved_by).toBe(mockRequest.approved_by);
      expect(result.approver_name).toBe("Admin User");
      expect(result.rejected_by).toBe(mockRequest.rejected_by);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT vr.*"),
        [id]
      );
    });

    it("devrait retourner null si aucune demande n'est trouvée", async () => {
      // Arrange
      const id = 999;

      // Mock pour la récupération qui ne trouve rien
      connectDB.execute.mockResolvedValueOnce([[]]);

      // Act
      const result = await VacationRequest.findById(id);

      // Assert
      expect(result).toBeNull();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT vr.*"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la récupération par ID", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");

      // Mock pour la récupération avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(VacationRequest.findById(id)).rejects.toThrow(dbError);
    });
  });

  describe("findByEmployeeId()", () => {
    it("devrait trouver toutes les demandes d'un employé", async () => {
      // Arrange
      const employeeId = 5;
      const mockRequests = [
        {
          id: 1,
          employee_id: employeeId,
          employee_name: "John Doe",
          status: "approved",
          approved_by: 8,
          rejected_by: null,
        },
        {
          id: 2,
          employee_id: employeeId,
          employee_name: "John Doe",
          status: "rejected",
          approved_by: null,
          rejected_by: 8,
        },
      ];

      // Mock pour la récupération
      connectDB.execute.mockResolvedValueOnce([mockRequests]);

      // Act
      const results = await VacationRequest.findByEmployeeId(employeeId);

      // Assert
      expect(results.length).toBe(2);
      expect(results[0]).toBeInstanceOf(VacationRequest);
      expect(results[0].id).toBe(mockRequests[0].id);
      expect(results[0].employee_id).toBe(employeeId);
      expect(results[0].employee_name).toBe(mockRequests[0].employee_name);
      expect(results[0].approved_by).toBe(mockRequests[0].approved_by);
      expect(results[1]).toBeInstanceOf(VacationRequest);
      expect(results[1].id).toBe(mockRequests[1].id);
      expect(results[1].employee_id).toBe(employeeId);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE vr.employee_id = ?"),
        [employeeId]
      );
    });

    it("devrait gérer les erreurs lors de la récupération par employee_id", async () => {
      // Arrange
      const employeeId = 5;
      const dbError = new Error("Database error");

      // Mock pour la récupération avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(
        VacationRequest.findByEmployeeId(employeeId)
      ).rejects.toThrow(dbError);
    });
  });

  describe("findByManagerId()", () => {
    it("devrait trouver toutes les demandes des employés d'un manager", async () => {
      // Arrange
      const managerId = 5;
      const mockEmployees = [{ id: 1 }, { id: 2 }];

      const mockRequests = [
        {
          id: 1,
          employee_id: 1,
          employee_name: "John Doe",
          status: "approved",
          approved_by: 8,
          approver_first_name: "Admin",
          approver_last_name: "User",
          rejected_by: null,
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: "Jane Smith",
          status: "rejected",
          approved_by: null,
          rejected_by: 8,
          rejecter_first_name: "Admin",
          rejecter_last_name: "User",
        },
      ];

      // Mock pour récupérer les employés
      connectDB.execute.mockResolvedValueOnce([mockEmployees]);

      // Mock pour récupérer les demandes
      connectDB.execute.mockResolvedValueOnce([mockRequests]);

      // Act
      const results = await VacationRequest.findByManagerId(managerId);

      // Assert
      expect(results.length).toBe(2);
      expect(results[0]).toBeInstanceOf(VacationRequest);
      expect(results[0].id).toBe(mockRequests[0].id);
      expect(results[0].employee_id).toBe(mockRequests[0].employee_id);
      expect(results[0].employee_name).toBe(mockRequests[0].employee_name);
      expect(results[0].approver_name).toBe("Admin User");
      expect(results[1]).toBeInstanceOf(VacationRequest);
      expect(results[1].id).toBe(mockRequests[1].id);
      expect(results[1].employee_id).toBe(mockRequests[1].employee_id);
      expect(results[1].rejecter_name).toBe("Admin User");
    });

    it("devrait retourner un tableau vide si aucun employé n'est géré par le manager", async () => {
      // Arrange
      const managerId = 5;

      // Mock pour récupérer les employés (aucun)
      connectDB.execute.mockResolvedValueOnce([[]]);

      // Act
      const results = await VacationRequest.findByManagerId(managerId);

      // Assert
      expect(results).toEqual([]);
    });

    it("devrait gérer les erreurs lors de la récupération par manager_id", async () => {
      // Arrange
      const managerId = 5;
      const dbError = new Error("Database error");

      // Mock pour la récupération avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(VacationRequest.findByManagerId(managerId)).rejects.toThrow(
        dbError
      );
    });
  });

  describe("updateStatus()", () => {
    it("devrait mettre à jour le statut à 'approved'", async () => {
      // Arrange
      const id = 1;
      const status = "approved";
      const adminId = 8;

      // Mock pour la mise à jour
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await VacationRequest.updateStatus(id, status, adminId);

      // Assert
      expect(result).toBeTruthy();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE vacation_requests"),
        expect.arrayContaining([
          status,
          adminId,
          expect.any(Date), // approved_at
          id,
        ])
      );
    });

    it("devrait mettre à jour le statut à 'rejected' avec raison", async () => {
      // Arrange
      const id = 1;
      const status = "rejected";
      const adminId = 8;
      const rejectionReason = "Période chargée";

      // Mock pour la mise à jour
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await VacationRequest.updateStatus(
        id,
        status,
        adminId,
        rejectionReason
      );

      // Assert
      expect(result).toBeTruthy();
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE vacation_requests"),
        expect.arrayContaining([
          status,
          adminId,
          expect.any(Date), // rejected_at
          rejectionReason,
          id,
        ])
      );
    });

    it("devrait retourner false si le statut est invalide", async () => {
      // Arrange
      const id = 1;
      const status = "invalid_status";
      const adminId = 8;

      // Act
      const result = await VacationRequest.updateStatus(id, status, adminId);

      // Assert
      expect(result).toBeFalsy();
      expect(connectDB.execute).not.toHaveBeenCalled();
    });

    it("devrait gérer les erreurs lors de la mise à jour du statut", async () => {
      // Arrange
      const id = 1;
      const status = "approved";
      const adminId = 8;
      const dbError = new Error("Database error");

      // Mock pour la mise à jour avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(
        VacationRequest.updateStatus(id, status, adminId)
      ).rejects.toThrow(dbError);
    });

    it("devrait mettre à jour une demande existante avec rejected_by et motif de rejet", async () => {
      // Arrange
      const adminId = 2;
      const vacationId = 1;
      const status = "rejected";
      const rejectionReason = "Période chargée";

      connectDB.execute.mockResolvedValueOnce([
        [{ reason: "Congés d'été" }],
        null,
      ]);

      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }, null]);

      // Act
      const result = await VacationRequest.updateStatus(
        vacationId,
        status,
        adminId,
        rejectionReason
      );

      // Assert
      expect(result).toBe(true);
      expect(connectDB.execute).toHaveBeenCalledTimes(2);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringMatching(
          /SELECT reason FROM vacation_requests WHERE id = \?/s
        ),
        [vacationId]
      );
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE vacation_requests.*SET.*WHERE id = \?/s),
        [
          status,
          adminId,
          expect.any(Date),
          "Congés d'été | Motif de rejet: Période chargée",
          vacationId,
        ]
      );
    });
  });

  describe("delete()", () => {
    it("devrait supprimer une demande de congés", async () => {
      // Arrange
      const id = 1;

      // Mock pour la suppression
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Act
      const result = await VacationRequest.delete(id);

      // Assert
      expect(result).toBe(true);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM vacation_requests WHERE id = ?"),
        [id]
      );
    });

    it("devrait retourner true même si aucune demande n'a été supprimée", async () => {
      // Arrange
      const id = 999;

      // Mock pour la suppression qui ne supprime rien
      connectDB.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      // Act
      const result = await VacationRequest.delete(id);

      // Assert
      expect(result).toBe(true);
      expect(connectDB.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM vacation_requests WHERE id = ?"),
        [id]
      );
    });

    it("devrait gérer les erreurs lors de la suppression", async () => {
      // Arrange
      const id = 1;
      const dbError = new Error("Database error");

      // Mock pour la suppression avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(VacationRequest.delete(id)).rejects.toThrow(dbError);
    });
  });

  describe("create()", () => {
    it("devrait créer une nouvelle demande de congés avec la méthode statique", async () => {
      // Arrange
      const requestData = {
        employee_id: 5,
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
        reason: "Congés d'été",
      };

      const insertId = 10;

      // Mock pour l'insertion réussie
      connectDB.execute.mockResolvedValueOnce([{ insertId }]);

      // Act
      const result = await VacationRequest.create(requestData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.id).toBe(insertId);
      expect(result.message).toContain("succès");
      expect(result.vacationRequest).toBeInstanceOf(VacationRequest);
      expect(result.vacationRequest.employee_id).toBe(requestData.employee_id);
      expect(result.vacationRequest.type).toBe(requestData.type);
    });

    it("devrait retourner un objet d'erreur lors de l'échec de la création", async () => {
      // Arrange
      const requestData = {
        employee_id: 5,
        type: "paid",
        start_date: "2023-07-15",
        end_date: "2023-07-25",
      };

      const dbError = new Error("Database error");

      // Mock pour l'insertion avec erreur
      connectDB.execute.mockRejectedValueOnce(dbError);

      // Act
      const result = await VacationRequest.create(requestData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("Database error");
    });
  });
});
