const connectDB = require("../config/db");
const Employee = require("./Employee");

class WorkHours {
  constructor(data) {
    data = data || {};

    this.id = data.id;
    this.employee_id = data.employee_id;
    this.date = data.date;
    this.expected_hours = data.expected_hours || 7.0;
    this.actual_hours = data.actual_hours || 0.0;
    this.balance = data.balance; // Calculé automatiquement par MySQL
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
      const formattedDate =
        this.date instanceof Date
          ? this.date.toISOString().split("T")[0]
          : this.date;

      if (this.id) {
        // Mise à jour
        await connectDB.execute(
          "UPDATE work_hours SET employee_id = ?, date = ?, expected_hours = ?, actual_hours = ? WHERE id = ?",
          [
            this.employee_id,
            formattedDate,
            this.expected_hours,
            this.actual_hours,
            this.id,
          ]
        );
      } else {
        // Création
        const [result] = await connectDB.execute(
          "INSERT INTO work_hours (employee_id, date, expected_hours, actual_hours) VALUES (?, ?, ?, ?)",
          [
            this.employee_id,
            formattedDate,
            this.expected_hours,
            this.actual_hours,
          ]
        );
        this.id = result.insertId;
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
        "SELECT employee_id FROM work_hours WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Enregistrement d'heures non trouvé");
      }

      const employeeId = rows[0].employee_id;

      // Supprimer l'enregistrement
      await connectDB.execute("DELETE FROM work_hours WHERE id = ?", [id]);

      // Mettre à jour le solde d'heures de l'employé
      await Employee.updateHourBalance(employeeId);

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
}

module.exports = WorkHours;
