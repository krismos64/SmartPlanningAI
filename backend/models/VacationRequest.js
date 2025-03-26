const connectDB = require("../config/db");
const {
  createAndEmitNotification,
} = require("../services/notificationService");

// Fonction pour calculer le nombre de jours ouvrés entre deux dates
function getWorkingDaysCount(startDate, endDate) {
  // Cloner les dates pour ne pas modifier les originales
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Réinitialiser les heures pour éviter les problèmes de comparaison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Si la date de fin est avant la date de début, retourner 0
  if (end < start) {
    return 0;
  }

  // Compter les jours ouvrés (du lundi au vendredi)
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    // Vérifier si ce n'est pas un weekend (0 = dimanche, 6 = samedi)
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

class VacationRequest {
  constructor(data) {
    this.id = data.id;
    this.employee_id = data.employee_id;
    this.employee_name = data.employee_name;
    this.creator_id = data.creator_id; // Identifiant de l'utilisateur qui a créé la demande
    this.type = data.type || "paid"; // Type de congé (paid, unpaid, sick, rtt, exceptional, recovery)
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.duration = data.duration; // Durée en jours ouvrés
    this.reason = data.reason; // Contient la raison principale (et anciennement le contenu des champs comment et rejection_reason)
    this.status = data.status || "pending";
    this.approved_by = data.approved_by ? parseInt(data.approved_by) : null; // ID de l'utilisateur qui a approuvé
    this.approved_at = data.approved_at;
    this.rejected_by = data.rejected_by ? parseInt(data.rejected_by) : null; // ID de l'utilisateur qui a rejeté
    this.rejected_at = data.rejected_at;
    // Les champs comment et rejection_reason sont désormais fusionnés dans reason
    this.attachment = data.attachment;
    this.quota_exceeded = data.quota_exceeded || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute(`
        SELECT vr.*, 
               e.first_name as employee_first_name, 
               e.last_name as employee_last_name,
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               a.first_name as approver_first_name, 
               a.last_name as approver_last_name,
               r.first_name as rejecter_first_name, 
               r.last_name as rejecter_last_name,
               cr.id as creator_id_check,
               cr.email as creator_email
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        LEFT JOIN users a ON vr.approved_by = a.id
        LEFT JOIN users r ON vr.rejected_by = r.id
        LEFT JOIN users cr ON vr.creator_id = cr.id
        ORDER BY vr.created_at DESC
      `);

      console.log(
        "VacationRequest.find() - Résultats bruts:",
        rows ? rows.length : 0
      );

      // Si aucun résultat n'est trouvé, retourner un tableau vide
      if (!rows || rows.length === 0) {
        console.log("VacationRequest.find() - Aucun résultat trouvé");
        return [];
      }

      console.log(
        "VacationRequest.find() - Détails des premiers résultats:",
        rows.slice(0, 3).map((r) => ({
          id: r.id,
          employee_id: r.employee_id,
          employee_first_name: r.employee_first_name,
          employee_last_name: r.employee_last_name,
          employee_name: r.employee_name,
          creator_id: r.creator_id,
          creator_id_check: r.creator_id_check,
          creator_email: r.creator_email,
        }))
      );

      // Inspecter en détail un enregistrement pour déboguer
      if (rows.length > 0) {
        console.log(
          "Inspection détaillée du premier enregistrement:",
          JSON.stringify(rows[0], null, 2)
        );
      }

      return rows.map((row) => {
        // Création d'une instance avec les données de base
        const request = new VacationRequest(row);

        // Assigner explicitement le nom de l'employé à partir des colonnes jointes
        if (row.employee_first_name && row.employee_last_name) {
          request.employee_name =
            `${row.employee_first_name} ${row.employee_last_name}`.trim();
          // Ajouter également les champs individuels pour permettre le formatage flexible
          request.employee_first_name = row.employee_first_name;
          request.employee_last_name = row.employee_last_name;
        } else if (row.employee_name) {
          request.employee_name = row.employee_name;
        } else {
          request.employee_name = `Employé #${row.employee_id}`;
        }

        // Documenter explicitement la structure
        console.log(
          `Traitement de la demande ID ${row.id}: employee_name=${request.employee_name}`
        );

        // Ajouter des noms complets pour les approbateurs/rejeteurs
        if (row.approver_first_name && row.approver_last_name) {
          request.approver_name =
            `${row.approver_first_name} ${row.approver_last_name}`.trim();
        }
        if (row.rejecter_first_name && row.rejecter_last_name) {
          request.rejecter_name =
            `${row.rejecter_first_name} ${row.rejecter_last_name}`.trim();
        }

        // Pour le debugging, ajouter les informations du créateur
        if (row.creator_email) {
          request.creator_email = row.creator_email;
        }

        // S'assurer que creator_id est un nombre
        if (request.creator_id) {
          request.creator_id = Number(request.creator_id);
        }

        return request;
      });
    } catch (error) {
      console.error("Erreur dans VacationRequest.find():", error);
      // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
      return [];
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connectDB.execute(
        `
        SELECT vr.*, 
               e.first_name as employee_first_name, 
               e.last_name as employee_last_name,
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               a.first_name as approver_first_name, 
               a.last_name as approver_last_name,
               r.first_name as rejecter_first_name, 
               r.last_name as rejecter_last_name,
               cr.id as creator_id_check,
               cr.email as creator_email
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        LEFT JOIN users a ON vr.approved_by = a.id
        LEFT JOIN users r ON vr.rejected_by = r.id
        LEFT JOIN users cr ON vr.creator_id = cr.id
        WHERE vr.id = ?
      `,
        [id]
      );

      console.log(
        `VacationRequest.findById(${id}) - Résultat trouvé:`,
        rows && rows.length > 0
      );

      // Si aucun résultat n'est trouvé, retourner null
      if (!rows || rows.length === 0) {
        console.log(`VacationRequest.findById(${id}) - Aucun résultat trouvé`);
        return null;
      }

      const row = rows[0];

      // Inspecter en détail cet enregistrement pour déboguer
      console.log(
        `Détails complets de la demande ${id}:`,
        JSON.stringify(row, null, 2)
      );

      const request = new VacationRequest(row);

      // Assigner explicitement le nom de l'employé à partir des colonnes jointes
      if (row.employee_first_name && row.employee_last_name) {
        request.employee_name =
          `${row.employee_first_name} ${row.employee_last_name}`.trim();
        // Ajouter également les champs individuels pour permettre le formatage flexible
        request.employee_first_name = row.employee_first_name;
        request.employee_last_name = row.employee_last_name;
      } else if (row.employee_name) {
        request.employee_name = row.employee_name;
      } else {
        request.employee_name = `Employé #${row.employee_id}`;
      }

      console.log(
        `Traitement de la demande ID ${id}: employee_name=${request.employee_name}`
      );

      // Ajouter des noms complets pour les approbateurs/rejeteurs
      if (row.approver_first_name && row.approver_last_name) {
        request.approver_name =
          `${row.approver_first_name} ${row.approver_last_name}`.trim();
      }
      if (row.rejecter_first_name && row.rejecter_last_name) {
        request.rejecter_name =
          `${row.rejecter_first_name} ${row.rejecter_last_name}`.trim();
      }

      // Pour le debugging, ajouter les informations du créateur
      if (row.creator_email) {
        request.creator_email = row.creator_email;
      }

      // S'assurer que creator_id est un nombre
      if (request.creator_id) {
        request.creator_id = Number(request.creator_id);
      }

      return request;
    } catch (error) {
      console.error(`Erreur dans VacationRequest.findById(${id}):`, error);
      // En cas d'erreur, retourner null plutôt que de propager l'erreur
      return null;
    }
  }

  static async findByEmployeeId(employeeId) {
    try {
      const [rows] = await connectDB.execute(
        `
        SELECT vr.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               a.first_name as approver_first_name, 
               a.last_name as approver_last_name,
               r.first_name as rejecter_first_name, 
               r.last_name as rejecter_last_name
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        LEFT JOIN users a ON vr.approved_by = a.id
        LEFT JOIN users r ON vr.rejected_by = r.id
        WHERE vr.employee_id = ?
        ORDER BY vr.created_at DESC
      `,
        [employeeId]
      );

      console.log(
        `VacationRequest.findByEmployeeId(${employeeId}) - Résultats:`,
        rows ? rows.length : 0
      );

      // Si aucun résultat n'est trouvé, retourner un tableau vide
      if (!rows || rows.length === 0) {
        console.log(
          `VacationRequest.findByEmployeeId(${employeeId}) - Aucun résultat trouvé`
        );
        return [];
      }

      return rows.map((row) => {
        const request = new VacationRequest(row);
        // Ajouter des noms complets pour les approbateurs/rejeteurs
        if (row.approver_first_name && row.approver_last_name) {
          request.approver_name =
            `${row.approver_first_name} ${row.approver_last_name}`.trim();
        }
        if (row.rejecter_first_name && row.rejecter_last_name) {
          request.rejecter_name =
            `${row.rejecter_first_name} ${row.rejecter_last_name}`.trim();
        }
        return request;
      });
    } catch (error) {
      console.error(
        `Erreur dans VacationRequest.findByEmployeeId(${employeeId}):`,
        error
      );
      // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
      return [];
    }
  }

  static async findByManagerId(managerId) {
    try {
      // D'abord, récupérer tous les employés gérés par ce manager
      const [employees] = await connectDB.execute(
        `SELECT id FROM employees WHERE manager_id = ?`,
        [managerId]
      );

      if (employees.length === 0) {
        return [];
      }

      // Extraire les IDs des employés
      const employeeIds = employees.map((emp) => emp.id);

      // Construire la chaîne de paramètres pour la requête IN
      const placeholders = employeeIds.map(() => "?").join(",");

      // Récupérer les demandes de congés pour ces employés
      const [rows] = await connectDB.execute(
        `
        SELECT vr.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               a.first_name as approver_first_name, 
               a.last_name as approver_last_name,
               r.first_name as rejecter_first_name, 
               r.last_name as rejecter_last_name
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        LEFT JOIN users a ON vr.approved_by = a.id
        LEFT JOIN users r ON vr.rejected_by = r.id
        WHERE vr.employee_id IN (${placeholders})
        ORDER BY vr.created_at DESC
        `,
        [...employeeIds]
      );

      return rows.map((row) => {
        const request = new VacationRequest(row);
        // Ajouter des noms complets pour les approbateurs/rejeteurs
        if (row.approver_first_name && row.approver_last_name) {
          request.approver_name =
            `${row.approver_first_name} ${row.approver_last_name}`.trim();
        }
        if (row.rejecter_first_name && row.rejecter_last_name) {
          request.rejecter_name =
            `${row.rejecter_first_name} ${row.rejecter_last_name}`.trim();
        }
        return request;
      });
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des demandes de congé pour le manager ${managerId}:`,
        error
      );
      throw error;
    }
  }

  static async updateStatus(id, status, adminId, rejectionReason = null) {
    try {
      const request = await this.findById(id);
      if (!request) {
        throw new Error("Demande de congé non trouvée");
      }

      // Enregistrer les valeurs pour le débogage
      console.log(`updateStatus - Paramètres reçus:`, {
        id,
        status,
        adminId,
        rejectionReason,
      });

      // Vérifier et convertir les types de paramètres
      const vacationId = parseInt(id, 10);
      if (isNaN(vacationId)) {
        throw new Error(`ID de congé invalide: ${id}`);
      }

      let adminIdNum = null;
      if (adminId) {
        adminIdNum = parseInt(adminId, 10);
        if (isNaN(adminIdNum)) {
          console.warn(`adminId invalide (${adminId}), utilisation de NULL`);
          adminIdNum = null;
        }
      }

      const updates = [];
      const params = [];

      if (status === "approved") {
        updates.push("status = 'approved'");
        updates.push("approved_by = ?");
        updates.push("approved_at = NOW()");
        updates.push("rejected_by = NULL");
        updates.push("rejected_at = NULL");
        params.push(adminIdNum);
      } else if (status === "rejected") {
        updates.push("status = 'rejected'");
        updates.push("rejected_by = ?");
        updates.push("rejected_at = NOW()");
        updates.push("approved_by = NULL");
        updates.push("approved_at = NULL");

        params.push(adminIdNum);

        // Si un motif de rejet est fourni, l'ajouter directement dans la colonne reason
        if (rejectionReason) {
          updates.push("reason = ?");
          // Construire le texte de raison avec le motif de rejet
          const reasonText = request.reason
            ? `${request.reason} | Motif de rejet: ${rejectionReason}`
            : `Motif de rejet: ${rejectionReason}`;
          params.push(reasonText);
        }
      } else if (status === "pending") {
        updates.push("status = 'pending'");
        updates.push("approved_by = NULL");
        updates.push("approved_at = NULL");
        updates.push("rejected_by = NULL");
        updates.push("rejected_at = NULL");
        // Aucun paramètre supplémentaire pour pending
      } else {
        throw new Error(
          `Statut invalide: ${status}. Doit être 'pending', 'approved' ou 'rejected'`
        );
      }

      updates.push("updated_at = NOW()");
      params.push(vacationId); // ID ajouté à la fin des paramètres

      // Journalisation pour le débogage
      console.log(
        `updateStatus - Requête SQL: UPDATE vacation_requests SET ${updates.join(
          ", "
        )} WHERE id = ?`
      );
      console.log(`updateStatus - Paramètres: ${JSON.stringify(params)}`);

      // Exécuter la requête
      try {
        const [result] = await connectDB.execute(
          `UPDATE vacation_requests SET ${updates.join(", ")} WHERE id = ?`,
          params
        );

        console.log(`updateStatus - Résultat de la mise à jour:`, {
          affectedRows: result.affectedRows,
          changedRows: result.changedRows,
          info: result.info,
        });

        // Notification (pas modifiée)
        try {
          await createAndEmitNotification(null, {
            user_id: request.employee_id,
            title:
              status === "approved"
                ? "Demande de congé approuvée"
                : status === "rejected"
                ? "Demande de congé rejetée"
                : "Demande remise en attente",
            message: `Votre demande de congé du ${request.start_date} au ${
              request.end_date
            } a été ${
              status === "approved"
                ? "approuvée"
                : status === "rejected"
                ? "rejetée"
                : "mise en attente"
            }.`,
            type:
              status === "approved"
                ? "success"
                : status === "rejected"
                ? "error"
                : "info",
            link: `/vacations/${id}`,
          });
          console.log(
            `updateStatus - Notification envoyée à l'employé ${request.employee_id}`
          );
        } catch (notifError) {
          console.error(
            `updateStatus - Erreur lors de l'envoi de la notification:`,
            notifError
          );
          // Continuer même en cas d'erreur de notification
        }

        return result.affectedRows > 0;
      } catch (sqlError) {
        console.error(`updateStatus - Erreur SQL:`, sqlError);
        throw sqlError;
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  }

  async save() {
    try {
      // Formater les dates pour MySQL
      let start_date = null;
      if (this.start_date) {
        if (this.start_date instanceof Date) {
          start_date = this.start_date.toISOString().split("T")[0];
        } else if (typeof this.start_date === "string") {
          // Si c'est déjà une chaîne, vérifier si c'est au format YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(this.start_date)) {
            start_date = this.start_date;
          } else {
            // Sinon, essayer de convertir
            start_date = new Date(this.start_date).toISOString().split("T")[0];
          }
        }
      }

      let end_date = null;
      if (this.end_date) {
        if (this.end_date instanceof Date) {
          end_date = this.end_date.toISOString().split("T")[0];
        } else if (typeof this.end_date === "string") {
          // Si c'est déjà une chaîne, vérifier si c'est au format YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(this.end_date)) {
            end_date = this.end_date;
          } else {
            // Sinon, essayer de convertir
            end_date = new Date(this.end_date).toISOString().split("T")[0];
          }
        }
      }

      // Formater les dates d'approbation/rejet
      let approved_at = null;
      if (this.approved_at) {
        if (this.approved_at instanceof Date) {
          approved_at = this.approved_at;
        } else if (typeof this.approved_at === "string") {
          approved_at = new Date(this.approved_at);
        }
      }

      let rejected_at = null;
      if (this.rejected_at) {
        if (this.rejected_at instanceof Date) {
          rejected_at = this.rejected_at;
        } else if (typeof this.rejected_at === "string") {
          rejected_at = new Date(this.rejected_at);
        }
      }

      // Validation: vérifier que la date de début est antérieure ou égale à la date de fin
      if (start_date && end_date) {
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);

        if (startDateObj > endDateObj) {
          throw new Error(
            "La date de début doit être antérieure ou égale à la date de fin"
          );
        }
      }

      // Calculer la durée en jours ouvrés selon les normes françaises
      let duration = this.duration;
      if (!duration && start_date && end_date) {
        try {
          // Calculer les jours ouvrés (lundi au vendredi)
          duration = getWorkingDaysCount(start_date, end_date);
        } catch (error) {
          console.error("Erreur lors du calcul de la durée:", error);
        }
      }

      console.log("Données de la demande de congé à sauvegarder:", {
        id: this.id,
        employee_id: this.employee_id,
        type: this.type,
        start_date,
        end_date,
        duration,
        reason: this.reason,
        status: this.status,
        approved_by: this.approved_by,
        approved_at: approved_at,
        rejected_by: this.rejected_by,
        rejected_at: rejected_at,
      });

      if (this.id) {
        // Mise à jour avec updated_at
        const query = `UPDATE vacation_requests 
           SET employee_id = ?, 
               type = ?, 
               start_date = ?, 
               end_date = ?, 
               duration = ?,
               reason = ?, 
               status = ?,
               approved_by = ?,
               approved_at = ?,
               rejected_by = ?,
               rejected_at = ?,
               updated_at = NOW()
           WHERE id = ?`;

        // S'assurer que employee_id est un nombre
        let employeeId;
        try {
          employeeId = parseInt(this.employee_id, 10);
          if (isNaN(employeeId)) {
            throw new Error("L'ID de l'employé doit être un nombre valide");
          }
        } catch (error) {
          console.error(
            "Erreur lors de la conversion de l'ID de l'employé:",
            error
          );
          throw new Error("L'ID de l'employé doit être un nombre valide");
        }

        const params = [
          employeeId, // Utiliser la version convertie en nombre
          this.type,
          start_date,
          end_date,
          duration,
          this.reason,
          this.status,
          this.approved_by,
          approved_at,
          this.rejected_by,
          rejected_at,
          this.id,
        ];

        console.log("Exécution de la requête SQL:", query);
        console.log("Paramètres:", params);

        const [result] = await connectDB.execute(query, params);
        console.log("Résultat de la mise à jour:", result);

        return this;
      } else {
        // Création
        // S'assurer que employee_id est un nombre
        let employeeId;
        try {
          employeeId = parseInt(this.employee_id, 10);
          if (isNaN(employeeId)) {
            throw new Error("L'ID de l'employé doit être un nombre valide");
          }
        } catch (error) {
          console.error(
            "Erreur lors de la conversion de l'ID de l'employé:",
            error
          );
          throw new Error("L'ID de l'employé doit être un nombre valide");
        }

        const [result] = await connectDB.execute(
          `INSERT INTO vacation_requests 
           (employee_id, type, start_date, end_date, duration, reason, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            employeeId, // Utiliser la version convertie en nombre
            this.type,
            start_date,
            end_date,
            duration,
            this.reason,
            this.status || "pending",
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de la demande de congé:",
        error
      );
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      const vacationRequest = await this.findById(id);
      if (!vacationRequest) return null;

      // Mettre à jour les propriétés
      Object.assign(vacationRequest, updateData);

      // Enregistrer les modifications
      await vacationRequest.save();
      return vacationRequest;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de la demande de congé ${id}:`,
        error
      );
      throw error;
    }
  }

  static async delete(id, io = null) {
    try {
      const request = await this.findById(id);
      if (!request) {
        throw new Error("Demande de congé non trouvée");
      }

      await connectDB.execute("DELETE FROM vacation_requests WHERE id = ?", [
        id,
      ]);

      if (io) {
        // Vérification explicite ici
        await createAndEmitNotification(io, {
          user_id: request.employee_id,
          title: "Demande de congé supprimée",
          message: `Votre demande de congé du ${request.start_date} au ${request.end_date} a été supprimée`,
          type: "warning",
          link: "/vacations",
        });
      }

      return { success: true };
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la demande de congé:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les statistiques des demandes de congés
   * @returns {Object} Statistiques des demandes de congés
   */
  static async getStatistics() {
    try {
      // Statistiques par statut
      const [statusStats] = await connectDB.execute(`
        SELECT status, COUNT(*) as count
        FROM vacation_requests
        GROUP BY status
      `);

      // Statistiques par type de congé
      const [typeStats] = await connectDB.execute(`
        SELECT type, COUNT(*) as count
        FROM vacation_requests
        GROUP BY type
      `);

      // Statistiques par mois (pour l'année en cours)
      const [monthlyStats] = await connectDB.execute(`
        SELECT 
          MONTH(start_date) as month, 
          COUNT(*) as count
        FROM vacation_requests
        WHERE YEAR(start_date) = YEAR(CURDATE())
        GROUP BY MONTH(start_date)
        ORDER BY month
      `);

      // Nombre total de jours de congés pris
      const [totalDaysResult] = await connectDB.execute(`
        SELECT 
          SUM(DATEDIFF(end_date, start_date) + 1) as total_days
        FROM vacation_requests
        WHERE status = 'approved'
      `);

      const totalDays = totalDaysResult[0].total_days || 0;

      // Demandes récentes (10 dernières)
      const [recentRequests] = await connectDB.execute(`
        SELECT vr.id, vr.type, vr.status, vr.start_date, vr.end_date,
               CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        ORDER BY vr.created_at DESC
        LIMIT 10
      `);

      return {
        byStatus: statusStats,
        byType: typeStats,
        byMonth: monthlyStats,
        totalDays: totalDays,
        recentRequests: recentRequests,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques de congés:",
        error
      );
      throw error;
    }
  }

  /**
   * Crée une nouvelle demande de congé
   * @param {Object} data - Données de la demande de congé
   * @returns {Object} Résultat de la création
   */
  static async create(data) {
    try {
      // Vérification et extraction des données avec valeurs par défaut pour les champs optionnels
      const {
        employee_id,
        creator_id = null,
        type = "paid",
        start_date,
        end_date,
        reason = "",
        io = null,
      } = data;

      console.log("VacationRequest.create - Données brutes reçues:", data);

      // Validation des données
      if (!employee_id) {
        throw new Error("L'ID de l'employé est requis");
      }

      // Conversion de l'ID de l'employé en nombre
      let employeeIdNum;
      try {
        employeeIdNum = parseInt(employee_id, 10);
        if (isNaN(employeeIdNum)) {
          throw new Error(
            `L'ID de l'employé n'est pas un nombre valide: ${employee_id}`
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la conversion de l'ID de l'employé:",
          error
        );
        throw new Error(
          `L'ID de l'employé n'est pas un nombre valide: ${employee_id}`
        );
      }

      // Validation des dates
      if (!start_date || !end_date) {
        throw new Error("Les dates de début et de fin sont requises");
      }

      // Conversion et vérification des dates
      let startDateFormatted;
      let endDateFormatted;

      try {
        // Formatage de la date de début
        if (start_date instanceof Date) {
          startDateFormatted = start_date.toISOString().split("T")[0];
        } else if (typeof start_date === "string") {
          if (/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
            startDateFormatted = start_date;
          } else {
            startDateFormatted = new Date(start_date)
              .toISOString()
              .split("T")[0];
          }
        } else {
          throw new Error("Format de date de début invalide");
        }

        // Formatage de la date de fin
        if (end_date instanceof Date) {
          endDateFormatted = end_date.toISOString().split("T")[0];
        } else if (typeof end_date === "string") {
          if (/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
            endDateFormatted = end_date;
          } else {
            endDateFormatted = new Date(end_date).toISOString().split("T")[0];
          }
        } else {
          throw new Error("Format de date de fin invalide");
        }
      } catch (error) {
        console.error("Erreur lors du formatage des dates:", error);
        throw new Error("Format de date invalide");
      }

      // Vérifier que la date de début est antérieure ou égale à la date de fin
      const startDateObj = new Date(startDateFormatted);
      const endDateObj = new Date(endDateFormatted);
      if (startDateObj > endDateObj) {
        throw new Error(
          "La date de début doit être antérieure ou égale à la date de fin"
        );
      }

      // Calcul des jours ouvrés
      const duration = getWorkingDaysCount(
        startDateFormatted,
        endDateFormatted
      );

      // Conversion de l'ID du créateur en nombre si présent
      let creatorIdNum = null;
      if (creator_id) {
        try {
          creatorIdNum = parseInt(creator_id, 10);
          if (isNaN(creatorIdNum)) {
            console.warn(
              `L'ID du créateur n'est pas un nombre valide: ${creator_id}, utilisation de NULL`
            );
            creatorIdNum = null;
          }
        } catch (error) {
          console.warn(
            `Erreur lors de la conversion de l'ID du créateur: ${error.message}, utilisation de NULL`
          );
          creatorIdNum = null;
        }
      }

      // Préparation des données validées et formatées pour l'insertion
      const validatedData = {
        employeeId: employeeIdNum,
        creatorId: creatorIdNum,
        type: type || "paid",
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        duration: duration,
        reason: reason || "",
      };

      console.log("VacationRequest.create - Données validées:", validatedData);

      // Définition de la requête SQL
      // Ne pas inclure la colonne ID - elle est auto-incrémentée
      const query = `
        INSERT INTO vacation_requests (
          employee_id, creator_id, type, start_date, end_date, 
          duration, reason, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `;

      // Création du tableau de paramètres avec le nombre exact de paramètres correspondant à la requête
      const params = [
        validatedData.employeeId,
        validatedData.creatorId,
        validatedData.type,
        validatedData.startDate,
        validatedData.endDate,
        validatedData.duration,
        validatedData.reason,
      ];

      console.log("VacationRequest.create - Requête SQL:", query);
      console.log("VacationRequest.create - Paramètres:", params);
      console.log(
        "VacationRequest.create - Nombre de paramètres:",
        params.length
      );

      // Exécution de la requête
      try {
        const [result] = await connectDB.execute(query, params);

        console.log("VacationRequest.create - Résultat de l'insertion:", {
          insertId: result.insertId,
          affectedRows: result.affectedRows,
        });

        // Création de notifications si io est disponible
        if (io) {
          try {
            // Notification pour l'employé
            await createAndEmitNotification(io, {
              user_id: employeeIdNum,
              title: "Nouvelle demande de congé",
              message: `Votre demande de congé du ${startDateFormatted} au ${endDateFormatted} a été créée`,
              type: "info",
              link: `/vacations/${result.insertId}`,
            });

            // Notifications pour les managers
            const [managers] = await connectDB.execute(
              "SELECT id FROM users WHERE role IN ('admin', 'manager')"
            );

            for (const manager of managers) {
              if (manager.id !== creatorIdNum) {
                await createAndEmitNotification(io, {
                  user_id: manager.id,
                  title: "Nouvelle demande de congé",
                  message: `Une nouvelle demande de congé a été créée pour ${
                    data.employee_name || `Employé #${employeeIdNum}`
                  }`,
                  type: "info",
                  link: `/vacations/${result.insertId}`,
                });
              }
            }
          } catch (notifError) {
            console.error(
              "Erreur lors de l'envoi des notifications:",
              notifError
            );
            // Continuer malgré les erreurs de notification
          }
        }

        return result;
      } catch (sqlError) {
        console.error("Erreur SQL lors de l'insertion:", sqlError);
        throw new Error(
          `Erreur lors de l'insertion dans la base de données: ${sqlError.message}`
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création de la demande de congé:",
        error
      );
      throw error;
    }
  }
}

module.exports = VacationRequest;
