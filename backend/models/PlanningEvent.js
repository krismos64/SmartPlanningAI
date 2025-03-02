const mysql = require("mysql2/promise");
const connectDB = require("../config/db");

class PlanningEvent {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.employee_id = data.employee_id;
    this.location = data.location;
    this.event_type = data.event_type;
    this.color = data.color;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
  }

  static async find() {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute("SELECT * FROM planning_events");
      return rows.map((row) => new PlanningEvent(row));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements de planning:",
        error
      );
      throw error;
    }
  }

  static async findById(id) {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute(
        "SELECT * FROM planning_events WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return new PlanningEvent(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'événement de planning ${id}:`,
        error
      );
      throw error;
    }
  }

  async save() {
    try {
      const connection = await connectDB();
      if (this.id) {
        // Mise à jour
        await connection.execute(
          "UPDATE planning_events SET title = ?, description = ?, start_date = ?, end_date = ?, employee_id = ?, location = ?, event_type = ?, color = ?, created_by = ? WHERE id = ?",
          [
            this.title,
            this.description,
            this.start_date,
            this.end_date,
            this.employee_id,
            this.location,
            this.event_type,
            this.color,
            this.created_by,
            this.id,
          ]
        );
        return this;
      } else {
        // Création
        const [result] = await connection.execute(
          "INSERT INTO planning_events (title, description, start_date, end_date, employee_id, location, event_type, color, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            this.title,
            this.description,
            this.start_date,
            this.end_date,
            this.employee_id,
            this.location,
            this.event_type || "other",
            this.color,
            this.created_by,
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'événement de planning:",
        error
      );
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      const planningEvent = await this.findById(id);
      if (!planningEvent) return null;

      // Mettre à jour les propriétés
      Object.assign(planningEvent, updateData);

      // Enregistrer les modifications
      await planningEvent.save();

      return planningEvent;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'événement de planning ${id}:`,
        error
      );
      throw error;
    }
  }

  static async delete(id) {
    try {
      const connection = await connectDB();
      await connection.execute("DELETE FROM planning_events WHERE id = ?", [
        id,
      ]);
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'événement de planning ${id}:`,
        error
      );
      throw error;
    }
  }

  static async findByDateRange(startDate, endDate) {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute(
        "SELECT * FROM planning_events WHERE start_date >= ? AND end_date <= ?",
        [startDate, endDate]
      );
      return rows.map((row) => new PlanningEvent(row));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements par plage de dates:",
        error
      );
      throw error;
    }
  }

  static async findByEmployee(employeeId) {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute(
        "SELECT * FROM planning_events WHERE employee_id = ?",
        [employeeId]
      );
      return rows.map((row) => new PlanningEvent(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des événements de l'employé ${employeeId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = PlanningEvent;
