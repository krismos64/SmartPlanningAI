const db = require("../config/db");
const { formatDateForMySQL } = require("../utils/dateUtils");

class WeeklySchedule {
  constructor(schedule) {
    this.id = schedule.id;
    this.employee_id = schedule.employee_id;
    this.week_start = schedule.week_start;
    this.week_end = schedule.week_end;
    this.schedule_data = schedule.schedule_data;
    this.total_hours = schedule.total_hours || 0;
    this.status = schedule.status || "draft";
    this.created_by = schedule.created_by;
    this.created_at = schedule.created_at;
    this.updated_at = schedule.updated_at;
  }

  /**
   * Enregistrer un nouveau planning hebdomadaire
   * @returns {Promise<WeeklySchedule>} Le planning enregistré
   */
  async save() {
    try {
      console.log("Sauvegarde du planning hebdomadaire:", {
        employee_id: this.employee_id,
        week_start: this.week_start,
      });

      // Formater la date pour MySQL
      const formattedWeekStart = formatDateForMySQL(this.week_start);

      // Calculer la date de fin (week_start + 6 jours)
      const startDate = new Date(this.week_start);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const formattedWeekEnd = formatDateForMySQL(endDate);

      // Convertir les données du planning en JSON si nécessaire
      const scheduleData =
        typeof this.schedule_data === "string"
          ? this.schedule_data
          : JSON.stringify(this.schedule_data);

      const sql = `
        INSERT INTO weekly_schedules 
        (employee_id, week_start, week_end, schedule_data, total_hours, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(sql, [
        this.employee_id,
        formattedWeekStart,
        formattedWeekEnd,
        scheduleData,
        this.total_hours,
        this.status,
        this.created_by || 1, // Valeur par défaut si non fournie
      ]);

      this.id = result.insertId;

      console.log("Planning hebdomadaire créé avec succès, ID:", this.id);

      return this;
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du planning hebdomadaire:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer tous les plannings hebdomadaires
   * @returns {Promise<Array<WeeklySchedule>>} Liste des plannings
   */
  static async findAll() {
    try {
      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        ORDER BY ws.week_start DESC, e.last_name ASC
      `;

      const [rows] = await db.execute(sql);

      return rows.map((row) => {
        // Convertir les données du planning de JSON en objet si nécessaire
        if (row.schedule_data && typeof row.schedule_data === "string") {
          try {
            row.schedule_data = JSON.parse(row.schedule_data);
          } catch (e) {
            console.error("Erreur lors du parsing des données du planning:", e);
          }
        }

        return new WeeklySchedule(row);
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des plannings hebdomadaires:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer un planning hebdomadaire par son ID
   * @param {number} id ID du planning
   * @returns {Promise<WeeklySchedule|null>} Le planning trouvé ou null
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        WHERE ws.id = ?
      `;

      const [rows] = await db.execute(sql, [id]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];

      // Convertir les données du planning de JSON en objet si nécessaire
      if (row.schedule_data && typeof row.schedule_data === "string") {
        try {
          row.schedule_data = JSON.parse(row.schedule_data);
        } catch (e) {
          console.error("Erreur lors du parsing des données du planning:", e);
        }
      }

      return new WeeklySchedule(row);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du planning hebdomadaire ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer les plannings hebdomadaires pour une semaine spécifique
   * @param {string} weekStart Date de début de semaine (YYYY-MM-DD)
   * @returns {Promise<Array<WeeklySchedule>>} Liste des plannings
   */
  static async findByWeek(weekStart) {
    try {
      // Formater la date pour MySQL
      const formattedWeekStart = formatDateForMySQL(weekStart);

      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department, e.contract_hours
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        WHERE ws.week_start = ?
        ORDER BY e.last_name ASC
      `;

      const [rows] = await db.execute(sql, [formattedWeekStart]);

      return rows.map((row) => {
        // Convertir les données du planning de JSON en objet si nécessaire
        if (row.schedule_data && typeof row.schedule_data === "string") {
          try {
            row.schedule_data = JSON.parse(row.schedule_data);
          } catch (e) {
            console.error("Erreur lors du parsing des données du planning:", e);
          }
        }

        return new WeeklySchedule(row);
      });
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des plannings pour la semaine du ${weekStart}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer les plannings hebdomadaires pour un employé spécifique
   * @param {number} employeeId ID de l'employé
   * @returns {Promise<Array<WeeklySchedule>>} Liste des plannings
   */
  static async findByEmployee(employeeId) {
    try {
      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        WHERE ws.employee_id = ?
        ORDER BY ws.week_start DESC
      `;

      const [rows] = await db.execute(sql, [employeeId]);

      return rows.map((row) => {
        // Convertir les données du planning de JSON en objet si nécessaire
        if (row.schedule_data && typeof row.schedule_data === "string") {
          try {
            row.schedule_data = JSON.parse(row.schedule_data);
          } catch (e) {
            console.error("Erreur lors du parsing des données du planning:", e);
          }
        }

        return new WeeklySchedule(row);
      });
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des plannings pour l'employé ${employeeId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer un planning hebdomadaire pour un employé et une semaine spécifiques
   * @param {number} employeeId ID de l'employé
   * @param {string} weekStart Date de début de semaine (YYYY-MM-DD)
   * @returns {Promise<WeeklySchedule|null>} Le planning trouvé ou null
   */
  static async findByEmployeeAndWeek(employeeId, weekStart) {
    try {
      // Formater la date pour MySQL
      const formattedWeekStart = formatDateForMySQL(weekStart);

      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        WHERE ws.employee_id = ? AND ws.week_start = ?
      `;

      const [rows] = await db.execute(sql, [employeeId, formattedWeekStart]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];

      // Convertir les données du planning de JSON en objet si nécessaire
      if (row.schedule_data && typeof row.schedule_data === "string") {
        try {
          row.schedule_data = JSON.parse(row.schedule_data);
        } catch (e) {
          console.error("Erreur lors du parsing des données du planning:", e);
        }
      }

      return new WeeklySchedule(row);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du planning pour l'employé ${employeeId} et la semaine du ${weekStart}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Mettre à jour un planning hebdomadaire
   * @param {number} id ID du planning
   * @param {object} updateData Données à mettre à jour
   * @returns {Promise<WeeklySchedule|null>} Le planning mis à jour ou null
   */
  static async update(id, updateData) {
    try {
      console.log(`Mise à jour du planning hebdomadaire ${id}:`, updateData);

      // Convertir les données du planning en JSON si nécessaire
      if (
        updateData.schedule_data &&
        typeof updateData.schedule_data !== "string"
      ) {
        updateData.schedule_data = JSON.stringify(updateData.schedule_data);
      }

      const sql = `
        UPDATE weekly_schedules
        SET 
          schedule_data = ?,
          total_hours = ?,
          status = ?,
          updated_at = NOW()
        WHERE id = ?
      `;

      await db.execute(sql, [
        updateData.schedule_data,
        updateData.total_hours,
        updateData.status || "draft",
        id,
      ]);

      console.log(`Planning hebdomadaire ${id} mis à jour avec succès`);

      // Récupérer le planning mis à jour
      return this.findById(id);
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du planning hebdomadaire ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Supprimer un planning hebdomadaire
   * @param {number} id ID du planning
   * @returns {Promise<boolean>} true si supprimé avec succès
   */
  static async delete(id) {
    try {
      console.log(`Suppression du planning hebdomadaire ${id}`);

      const sql = `DELETE FROM weekly_schedules WHERE id = ?`;

      await db.execute(sql, [id]);

      console.log(`Planning hebdomadaire ${id} supprimé avec succès`);

      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du planning hebdomadaire ${id}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = WeeklySchedule;
