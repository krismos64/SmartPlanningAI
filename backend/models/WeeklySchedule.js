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
   * Valider que les données du planning sont un JSON valide
   * @param {*} data Les données à valider
   * @returns {string} Les données au format JSON
   * @throws {Error} Si les données ne sont pas un JSON valide
   */
  static validateScheduleData(data) {
    if (!data) {
      throw new Error("Les données du planning sont requises");
    }

    // Si c'est déjà une chaîne, vérifier que c'est un JSON valide
    if (typeof data === "string") {
      try {
        JSON.parse(data);
        return data;
      } catch (e) {
        throw new Error("Les données du planning ne sont pas un JSON valide");
      }
    }

    // Si c'est un objet, le convertir en JSON
    try {
      return JSON.stringify(data);
    } catch (e) {
      throw new Error(
        "Impossible de convertir les données du planning en JSON"
      );
    }
  }

  /**
   * Enregistrer un nouveau planning hebdomadaire
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async save() {
    try {
      console.log("Sauvegarde du planning hebdomadaire:", {
        employee_id: this.employee_id,
        week_start: this.week_start,
        schedule_data_type: typeof this.schedule_data,
        has_time_slots:
          this.schedule_data && this.schedule_data.includes("timeSlots"),
      });

      console.log("🧪 Contenu de schedule_data:", this.schedule_data);

      // Vérifier que l'ID employé est un nombre valide
      const employeeId = parseInt(this.employee_id);
      if (isNaN(employeeId)) {
        throw new Error("L'ID de l'employé doit être un nombre valide");
      }

      // Formater la date pour MySQL
      const formattedWeekStart = formatDateForMySQL(this.week_start);
      if (!formattedWeekStart) {
        throw new Error("Date de début de semaine invalide");
      }

      // Vérifier si un planning existe déjà pour cet employé à cette date
      try {
        const existingSchedule = await WeeklySchedule.findByEmployeeAndWeek(
          employeeId,
          formattedWeekStart
        );

        // Si un planning existe déjà, mettre à jour plutôt que créer
        if (existingSchedule) {
          console.log(
            "Un planning existe déjà pour cet employé à cette date. Mise à jour du planning existant."
          );

          // Préparer les données pour la mise à jour
          const updateData = {
            schedule_data: this.schedule_data,
            total_hours: this.total_hours || 0,
            status: this.status || "draft",
          };

          // Mettre à jour le planning existant
          const updatedSchedule = await WeeklySchedule.update(
            existingSchedule.id,
            updateData
          );

          return {
            success: true,
            id: existingSchedule.id,
            message: "Planning existant mis à jour avec succès",
            isUpdate: true,
            schedule: updatedSchedule,
          };
        }
      } catch (findError) {
        console.error(
          "Erreur lors de la vérification du planning existant:",
          findError
        );
        // Continuer avec la création si l'erreur est liée à la recherche
      }

      // Calculer la date de fin (week_start + 6 jours)
      const startDate = new Date(this.week_start);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const formattedWeekEnd = formatDateForMySQL(endDate);

      // Valider et convertir les données du planning en JSON
      const scheduleData = WeeklySchedule.validateScheduleData(
        this.schedule_data
      );

      // Valider le total des heures
      const totalHours = parseFloat(this.total_hours) || 0;

      const sql = `
        INSERT INTO weekly_schedules 
        (employee_id, week_start, week_end, schedule_data, total_hours, status, created_by, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.execute(sql, [
        employeeId,
        formattedWeekStart,
        formattedWeekEnd,
        scheduleData,
        totalHours,
        this.status || "draft",
        this.created_by || 1, // Valeur par défaut si non fournie
      ]);

      this.id = result.insertId;

      console.log("Planning hebdomadaire créé avec succès, ID:", this.id);

      return {
        success: true,
        id: this.id,
        message: "Planning créé avec succès",
        schedule: this,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du planning hebdomadaire:",
        error
      );

      // Si l'erreur est liée à la contrainte d'unicité, renvoyer un message plus clair
      if (
        error.message &&
        error.message.includes("Duplicate entry") &&
        error.message.includes("employee_week")
      ) {
        return {
          success: false,
          error:
            "Un planning existe déjà pour cet employé à cette date. Veuillez utiliser la fonction de mise à jour.",
          message: "Un planning existe déjà pour cet employé à cette date",
        };
      }

      return {
        success: false,
        error: error.message,
        message: "Erreur lors de la création du planning",
      };
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
      console.log("Recherche des plannings pour la semaine du:", weekStart);

      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return [];
      }

      // Formater la date pour MySQL
      const formattedWeekStart = formatDateForMySQL(weekStart);
      console.log("Date formatée pour MySQL:", formattedWeekStart);

      if (!formattedWeekStart) {
        console.error("Format de date invalide:", weekStart);
        return [];
      }

      // Utiliser la fonction DATE() de MySQL pour comparer uniquement les dates sans les heures
      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department, e.contractHours
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        WHERE DATE(ws.week_start) = DATE(?)
        ORDER BY e.last_name ASC
      `;

      console.log("Exécution de la requête SQL avec date:", formattedWeekStart);
      const [rows] = await db.execute(sql, [formattedWeekStart]);
      console.log(`${rows.length} plannings trouvés`);

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
      console.log(
        "Recherche de planning pour employé:",
        employeeId,
        "semaine du:",
        weekStart
      );

      if (!employeeId) {
        console.error("ID employé non spécifié");
        return null;
      }

      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return null;
      }

      // Formater la date pour MySQL
      const formattedWeekStart = formatDateForMySQL(weekStart);
      console.log("Date formatée pour MySQL:", formattedWeekStart);

      if (!formattedWeekStart) {
        console.error("Format de date invalide:", weekStart);
        return null;
      }

      // Utiliser la fonction DATE() de MySQL pour comparer uniquement les dates sans les heures
      const sql = `
        SELECT ws.*, e.first_name, e.last_name, e.role, e.department, e.contractHours
        FROM weekly_schedules ws
        JOIN employees e ON ws.employee_id = e.id
        WHERE ws.employee_id = ? AND DATE(ws.week_start) = DATE(?)
      `;

      console.log(
        "Exécution de la requête SQL avec employé:",
        employeeId,
        "et date:",
        formattedWeekStart
      );
      const [rows] = await db.execute(sql, [employeeId, formattedWeekStart]);
      console.log("Nombre de résultats:", rows.length);

      if (rows.length === 0) {
        console.log("Aucun planning trouvé pour cet employé et cette semaine");
        return null;
      }

      const row = rows[0];
      console.log("Planning trouvé avec ID:", row.id);

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
   * @param {number} id - ID du planning à mettre à jour
   * @param {Object} data - Données à mettre à jour
   * @param {number} updatedBy - ID de l'utilisateur qui effectue la mise à jour
   * @returns {Promise<WeeklySchedule>} Le planning mis à jour
   */
  static async update(id, data, updatedBy = null) {
    try {
      console.log(`Mise à jour du planning #${id}:`, data);

      // Valider l'ID
      const scheduleId = parseInt(id);
      if (isNaN(scheduleId) || scheduleId <= 0) {
        throw new Error("ID de planning invalide");
      }

      // Construire la requête SQL dynamiquement
      let sql = "UPDATE weekly_schedules SET ";
      const params = [];
      const updates = [];

      // Traiter les données du planning si fournies
      if (data.schedule_data !== undefined) {
        const validatedData = this.validateScheduleData(data.schedule_data);
        updates.push("schedule_data = ?");
        params.push(validatedData);
      }

      // Traiter le total des heures si fourni
      if (data.total_hours !== undefined) {
        const totalHours = parseFloat(data.total_hours) || 0;
        updates.push("total_hours = ?");
        params.push(totalHours);
      }

      // Traiter le statut si fourni
      if (data.status) {
        updates.push("status = ?");
        params.push(data.status);
      }

      // Enregistrer l'utilisateur qui fait la mise à jour
      if (updatedBy) {
        updates.push("updated_by = ?");
        params.push(updatedBy);
      }

      // Toujours mettre à jour le timestamp
      updates.push("updated_at = NOW()");

      // Si aucune mise à jour n'est demandée, retourner le planning existant
      if (updates.length === 0) {
        return await this.findById(id);
      }

      // Finaliser la requête SQL
      sql += updates.join(", ") + " WHERE id = ?";
      params.push(scheduleId);

      console.log("Exécution de la requête SQL:", {
        sql,
        params: params.map((p) =>
          typeof p === "string" && p.length > 100
            ? p.substring(0, 100) + "..."
            : p
        ),
      });

      // Exécuter la requête
      const [result] = await db.execute(sql, params);

      if (result.affectedRows === 0) {
        throw new Error(`Planning #${id} non trouvé`);
      }

      console.log(`Planning #${id} mis à jour avec succès`);

      // Récupérer et retourner le planning mis à jour
      return await this.findById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du planning #${id}:`, error);
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
