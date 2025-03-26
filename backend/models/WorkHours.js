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

    // Conversion et valeurs par défaut pour expected_hours
    this.expected_hours =
      data.expected_hours !== undefined ? parseFloat(data.expected_hours) : 7.0;

    // Conversion et valeurs par défaut pour actual_hours
    this.actual_hours =
      data.actual_hours !== undefined ? parseFloat(data.actual_hours) : 0.0;

    // Si balance est fourni, l'utiliser, sinon calculer
    if (data.balance !== undefined) {
      this.balance = parseFloat(data.balance);
    } else {
      this.balance = this.actual_hours - this.expected_hours;
    }

    this.description = data.description || "";
    this.user_id = data.user_id || null;
    this.created_at = data.created_at || new Date();

    console.log(
      `WorkHours construit: employee_id=${this.employee_id}, actual=${this.actual_hours}, expected=${this.expected_hours}, balance=${this.balance}`
    );
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

      let id;

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

        id = this.id;
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
        id = result.insertId;
        this.id = id;
      }

      // Créer une notification pour l'employé (avec try/catch pour éviter les interruptions)
      try {
        const notificationData = {
          user_id: this.employee_id,
          title: this.id
            ? "Heures de travail mises à jour"
            : "Nouvelles heures de travail",
          message: this.id
            ? `Vos heures de travail du ${formattedDate} ont été mises à jour (${this.actual_hours}h travaillées)`
            : `Des heures de travail ont été ajoutées pour le ${formattedDate} (${this.actual_hours}h travaillées)`,
          type: "info",
          link: `/work-hours/${id}`,
        };

        await createAndEmitNotification(null, notificationData).catch((err) => {
          console.warn(
            "Erreur non bloquante lors de la création de notification:",
            err
          );
        });
      } catch (notifError) {
        console.warn(
          "Erreur non bloquante lors de la création de notification:",
          notifError
        );
        // Ne pas bloquer la sauvegarde si la notification échoue
      }

      // Mettre à jour le solde d'heures de l'employé manuellement au lieu d'utiliser le trigger
      try {
        // Calculer le nouveau solde en sommant toutes les entrées work_hours
        const [result] = await connectDB.execute(
          `SELECT SUM(balance) AS total_balance 
           FROM work_hours WHERE employee_id = ?`,
          [this.employee_id]
        );

        const totalBalance = result[0]?.total_balance || 0;

        // Mettre à jour directement le solde dans la table employees sans passer par updateHourBalance
        await connectDB.execute(
          "UPDATE employees SET hour_balance = ? WHERE id = ?",
          [totalBalance, this.employee_id]
        );
      } catch (balanceError) {
        console.warn("Erreur lors de la mise à jour du solde:", balanceError);
      }

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
      // Récupérer les informations avant la suppression
      const [rows] = await connectDB.execute(
        "SELECT employee_id, date, actual_hours FROM work_hours WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Heures de travail non trouvées");
      }

      const { employee_id, date, actual_hours } = rows[0];
      const formattedDate = new Date(date).toISOString().split("T")[0];

      // Supprimer l'enregistrement
      await connectDB.execute("DELETE FROM work_hours WHERE id = ?", [id]);

      // Mettre à jour le solde d'heures de l'employé
      await Employee.updateHourBalance(employee_id);

      // Créer une notification pour l'employé - avec gestion d'erreur
      try {
        if (employee_id && typeof createAndEmitNotification === "function") {
          await createAndEmitNotification(null, {
            user_id: employee_id,
            title: "Heures de travail supprimées",
            message: `Vos heures de travail du ${formattedDate} (${actual_hours}h) ont été supprimées`,
            type: "warning",
            link: "/work-hours",
          });
        }
      } catch (notifError) {
        console.warn(
          "Erreur non bloquante lors de la création de notification pour les heures de travail:",
          notifError
        );
        // Ne pas bloquer la suppression si la notification échoue
      }

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
