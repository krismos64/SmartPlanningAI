const connectDB = require("../config/db");

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
    this.reason = data.reason;
    this.status = data.status || "pending";
    this.approved_by = data.approved_by ? parseInt(data.approved_by) : null; // Convertir en INT
    this.approved_at = data.approved_at;
    this.rejected_by = data.rejected_by ? parseInt(data.rejected_by) : null; // Convertir en INT
    this.rejected_at = data.rejected_at;
    this.rejection_reason = data.rejection_reason;
    this.attachment = data.attachment;
    this.quota_exceeded = data.quota_exceeded || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute(`
        SELECT vr.*, 
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
        rows.map((r) => ({
          id: r.id,
          employee_id: r.employee_id,
          creator_id: r.creator_id,
          creator_id_check: r.creator_id_check,
          creator_email: r.creator_email,
        }))
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
      console.error(
        "Erreur lors de la récupération des demandes de congés:",
        error
      );
      throw error;
    }
  }

  static async findById(id) {
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
        WHERE vr.id = ?
      `,
        [id]
      );
      if (rows.length === 0) return null;

      const request = new VacationRequest(rows[0]);
      // Ajouter des noms complets pour les approbateurs/rejeteurs
      if (rows[0].approver_first_name && rows[0].approver_last_name) {
        request.approver_name =
          `${rows[0].approver_first_name} ${rows[0].approver_last_name}`.trim();
      }
      if (rows[0].rejecter_first_name && rows[0].rejecter_last_name) {
        request.rejecter_name =
          `${rows[0].rejecter_first_name} ${rows[0].rejecter_last_name}`.trim();
      }
      return request;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la demande de congé ${id}:`,
        error
      );
      throw error;
    }
  }

  static async findByEmployeeId(employeeId) {
    try {
      const [rows] = await connectDB.execute(
        `
        SELECT vr.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        WHERE vr.employee_id = ?
        ORDER BY vr.created_at DESC
      `,
        [employeeId]
      );
      return rows.map((row) => new VacationRequest(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des demandes de congé pour l'employé ${employeeId}:`,
        error
      );
      throw error;
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
      let query = "";
      let params = [];

      const now = new Date();

      if (status === "approved") {
        // Mise à jour pour approuver
        query = `
          UPDATE vacation_requests 
          SET status = ?, approved_by = ?, approved_at = ?, rejected_by = NULL, rejected_at = NULL, rejection_reason = NULL, updated_at = NOW()
          WHERE id = ?
        `;
        params = [status, adminId, now, id];
      } else if (status === "rejected") {
        // Mise à jour pour rejeter
        query = `
          UPDATE vacation_requests 
          SET status = ?, rejected_by = ?, rejected_at = ?, rejection_reason = ?, approved_by = NULL, approved_at = NULL, updated_at = NOW()
          WHERE id = ?
        `;
        params = [status, adminId, now, rejectionReason, id];
      } else if (status === "pending") {
        // Réinitialisation à l'état en attente
        query = `
          UPDATE vacation_requests 
          SET status = ?, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL, rejection_reason = NULL, updated_at = NOW()
          WHERE id = ?
        `;
        params = [status, id];
      } else {
        // Statut invalide
        return false;
      }

      const [result] = await connectDB.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du statut de la demande de congé ${id}:`,
        error
      );
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
        rejection_reason: this.rejection_reason,
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
               rejection_reason = ?,
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
          this.rejection_reason,
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

  static async delete(id) {
    try {
      await connectDB.execute("DELETE FROM vacation_requests WHERE id = ?", [
        id,
      ]);
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de la demande de congé ${id}:`,
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
      console.log("VacationRequest.create - Données reçues:", data);

      // Vérifier si l'employé existe
      const [employeeCheck] = await connectDB.execute(
        "SELECT id FROM employees WHERE id = ?",
        [data.employee_id]
      );

      if (employeeCheck.length === 0) {
        console.error(
          `L'employé avec l'ID ${data.employee_id} n'existe pas dans la base de données`
        );
        return {
          success: false,
          message: "L'employé spécifié n'existe pas",
        };
      }

      // Calculer la durée en jours ouvrés si elle n'est pas spécifiée
      if (!data.duration) {
        data.duration = getWorkingDaysCount(data.start_date, data.end_date);
      }

      // Construire la requête d'insertion
      let query = "INSERT INTO vacation_requests (";
      let placeholders = "";
      let values = [];
      let fields = [];

      // Ajouter chaque champ valide à l'insertion
      if (data.employee_id) {
        fields.push("employee_id");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.employee_id);
      }

      if (data.creator_id) {
        fields.push("creator_id");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.creator_id);
      }

      if (data.start_date) {
        fields.push("start_date");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.start_date);
      }

      if (data.end_date) {
        fields.push("end_date");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.end_date);
      }

      if (data.duration) {
        fields.push("duration");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.duration);
      }

      if (data.type) {
        fields.push("type");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.type);
      }

      if (data.reason) {
        fields.push("reason");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.reason);
      }

      if (data.status) {
        fields.push("status");
        placeholders += placeholders ? ", ?" : "?";
        values.push(data.status);
      }

      // Compléter la requête
      query += fields.join(", ") + ") VALUES (" + placeholders + ")";

      console.log("Requête SQL:", query);
      console.log("Valeurs:", values);

      // Exécuter la requête
      const [result] = await connectDB.execute(query, values);

      if (result.insertId) {
        console.log(`Demande de congé créée avec l'ID ${result.insertId}`);
        return {
          success: true,
          message: "Demande de congé créée avec succès",
          id: result.insertId,
        };
      } else {
        console.error("Échec de la création de la demande de congé:", result);
        return {
          success: false,
          message: "Échec de la création de la demande de congé",
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création de la demande de congé:",
        error
      );
      return {
        success: false,
        message: `Erreur lors de la création de la demande de congé: ${error.message}`,
      };
    }
  }
}

module.exports = VacationRequest;
