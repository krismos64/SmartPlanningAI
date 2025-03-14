const connectDB = require("../config/db");

class VacationRequest {
  constructor(data) {
    this.id = data.id;
    this.employee_id = data.employee_id;
    this.employee_name = data.employee_name;
    this.type = data.type || "paid"; // Type de congé (paid, unpaid, sick, rtt, exceptional, recovery)
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.reason = data.reason;
    this.status = data.status || "pending";
    this.approved_by = data.approved_by;
    this.approved_at = data.approved_at;
    this.rejected_by = data.rejected_by;
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
               CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        ORDER BY vr.created_at DESC
      `);
      return rows.map((row) => new VacationRequest(row));
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
               CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM vacation_requests vr
        LEFT JOIN employees e ON vr.employee_id = e.id
        WHERE vr.id = ?
      `,
        [id]
      );
      if (rows.length === 0) return null;
      return new VacationRequest(rows[0]);
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

      console.log("Données de la demande de congé à sauvegarder:", {
        id: this.id,
        employee_id: this.employee_id,
        type: this.type,
        start_date,
        end_date,
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
           (employee_id, type, start_date, end_date, reason, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            employeeId, // Utiliser la version convertie en nombre
            this.type,
            start_date,
            end_date,
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
      console.log(
        "Création d'une nouvelle demande de congé avec les données:",
        data
      );

      const vacationRequest = new VacationRequest(data);
      await vacationRequest.save();

      return {
        success: true,
        id: vacationRequest.id,
        message: "Demande de congé créée avec succès",
        vacationRequest,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la création de la demande de congé:",
        error
      );
      return {
        success: false,
        message:
          error.message || "Erreur lors de la création de la demande de congé",
      };
    }
  }
}

module.exports = VacationRequest;
