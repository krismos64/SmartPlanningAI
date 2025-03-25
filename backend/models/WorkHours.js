const connectDB = require("../config/db");
const Employee = require("./Employee");
const {
  createAndEmitNotification,
} = require("../services/notificationService");

class WorkHours {
  constructor(data) {
    data = data || {};

    this.id = data.id;
    this.employee_id = data.employee_id;
    this.date = data.date;
    this.expected_hours = data.expected_hours || 7.0;
    this.actual_hours = data.actual_hours || 0.0;
    this.balance =
      data.balance !== undefined
        ? data.balance
        : this.actual_hours - this.expected_hours;
    this.description = data.description || "";
    this.user_id = data.user_id || null;
    this.created_at = data.created_at || new Date();
  }

  static async findByEmployeeId(employeeId, startDate = null, endDate = null) {
    try {
      let query = "SELECT * FROM work_hours WHERE employee_id = ?";
      const params = [employeeId];

      if (startDate && endDate) {
        query += " AND date BETWEEN ? AND ?";
        params.push(startDate, endDate);
      } else if (startDate) {
        query += " AND date >= ?";
        params.push(startDate);
      } else if (endDate) {
        query += " AND date <= ?";
        params.push(endDate);
      }

      query += " ORDER BY date DESC";

      const [rows] = await connectDB.execute(query, params);
      return rows.map((row) => new WorkHours(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des heures pour l'employé ${employeeId}:`,
        error
      );
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connectDB.execute(
        "SELECT * FROM work_hours WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return new WorkHours(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des heures avec l'ID ${id}:`,
        error
      );
      throw error;
    }
  }

  async save() {
    try {
      // Formater la date pour MySQL
      const formattedDate = this.date
        ? new Date(this.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (this.id) {
        // Mise à jour
        await connectDB.execute(
          "UPDATE work_hours SET employee_id = ?, date = ?, expected_hours = ?, actual_hours = ?, balance = ?, description = ?, user_id = ? WHERE id = ?",
          [
            this.employee_id,
            formattedDate,
            this.expected_hours,
            this.actual_hours,
            this.balance,
            this.description,
            this.user_id,
            this.id,
          ]
        );

        // Créer une notification pour l'employé
        await createAndEmitNotification(this.io, {
          user_id: this.employee_id,
          title: "Heures de travail mises à jour",
          message: `Vos heures de travail du ${formattedDate} ont été mises à jour (${this.actual_hours}h travaillées)`,
          type: "info",
          link: `/work-hours/${this.id}`,
        });
      } else {
        // Insertion
        const [result] = await connectDB.execute(
          "INSERT INTO work_hours (employee_id, date, expected_hours, actual_hours, balance, description, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            this.employee_id,
            formattedDate,
            this.expected_hours,
            this.actual_hours,
            this.balance,
            this.description,
            this.user_id,
            new Date(),
          ]
        );
        this.id = result.insertId;

        // Créer une notification pour l'employé
        await createAndEmitNotification(this.io, {
          user_id: this.employee_id,
          title: "Nouvelles heures de travail",
          message: `Des heures de travail ont été ajoutées pour le ${formattedDate} (${this.actual_hours}h travaillées)`,
          type: "info",
          link: `/work-hours/${this.id}`,
        });
      }

      // Mettre à jour le solde d'heures de l'employé
      await Employee.updateHourBalance(this.employee_id);

      return this;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des heures:", error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const workHours = new WorkHours(data);
      return await workHours.save();
    } catch (error) {
      console.error("Erreur lors de la création des heures:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Récupérer l'ID de l'employé avant la suppression
      const [rows] = await connectDB.execute(
        "SELECT employee_id, date, actual_hours FROM work_hours WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Enregistrement d'heures non trouvé");
      }

      const { employee_id, date, actual_hours } = rows[0];
      const formattedDate = new Date(date).toISOString().split("T")[0];

      // Supprimer l'enregistrement
      await connectDB.execute("DELETE FROM work_hours WHERE id = ?", [id]);

      // Mettre à jour le solde d'heures de l'employé
      await Employee.updateHourBalance(employee_id);

      // Créer une notification pour l'employé
      await createAndEmitNotification(rows[0].io, {
        user_id: employee_id,
        title: "Heures de travail supprimées",
        message: `Vos heures de travail du ${formattedDate} (${actual_hours}h) ont été supprimées`,
        type: "warning",
        link: "/work-hours",
      });

      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression des heures avec l'ID ${id}:`,
        error
      );
      throw error;
    }
  }

  static async getEmployeeBalance(employeeId) {
    try {
      const [rows] = await connectDB.execute(
        "SELECT hour_balance FROM employees WHERE id = ?",
        [employeeId]
      );

      if (rows.length === 0) {
        throw new Error("Employé non trouvé");
      }

      return rows[0].hour_balance || 0;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du solde d'heures pour l'employé ${employeeId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer les heures de travail créées par un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des heures de travail créées par l'utilisateur
   */
  static async findByUserId(userId) {
    try {
      const [rows] = await connectDB.execute(
        "SELECT * FROM work_hours WHERE user_id = ? ORDER BY date DESC",
        [userId]
      );
      return rows.map((row) => new WorkHours(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des heures pour l'utilisateur ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer les heures de travail pour un employé spécifique créées par un utilisateur spécifique
   * @param {number} employeeId - ID de l'employé
   * @param {number} userId - ID de l'utilisateur
   * @param {string} startDate - Date de début (optionnelle)
   * @param {string} endDate - Date de fin (optionnelle)
   * @returns {Promise<Array>} Liste des heures de travail
   */
  static async findByEmployeeAndUser(
    employeeId,
    userId,
    startDate = null,
    endDate = null
  ) {
    try {
      let query =
        "SELECT * FROM work_hours WHERE employee_id = ? AND user_id = ?";
      const params = [employeeId, userId];

      if (startDate && endDate) {
        query += " AND date BETWEEN ? AND ?";
        params.push(startDate, endDate);
      } else if (startDate) {
        query += " AND date >= ?";
        params.push(startDate);
      } else if (endDate) {
        query += " AND date <= ?";
        params.push(endDate);
      }

      query += " ORDER BY date DESC";

      const [rows] = await connectDB.execute(query, params);
      return rows.map((row) => new WorkHours(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des heures pour l'employé ${employeeId} et l'utilisateur ${userId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = WorkHours;
