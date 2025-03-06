const connectDB = require("../config/db");

class Shift {
  constructor(data) {
    // S'assurer que data est un objet
    data = data || {};

    // Initialisation des propriétés
    this.id = data.id;
    this.employee_id = data.employee_id;
    this.start_time = data.start_time || data.startTime || null;
    this.end_time = data.end_time || data.endTime || null;
    this.created_by = data.created_by || data.createdBy || null;
    this.status = data.status || "scheduled"; // Valeurs possibles: scheduled, completed, cancelled
    this.notes = data.notes || "";
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute("SELECT * FROM shifts");
      return rows.map((row) => new Shift(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des shifts:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connectDB.execute(
        "SELECT * FROM shifts WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return new Shift(rows[0]);
    } catch (error) {
      console.error(`Erreur lors de la récupération du shift ${id}:`, error);
      throw error;
    }
  }

  static async findByEmployeeId(employeeId) {
    try {
      const [rows] = await connectDB.execute(
        "SELECT * FROM shifts WHERE employee_id = ?",
        [employeeId]
      );
      return rows.map((row) => new Shift(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des shifts pour l'employé ${employeeId}:`,
        error
      );
      throw error;
    }
  }

  // Vérifier les chevauchements de shifts pour un employé
  async hasOverlap() {
    try {
      const [rows] = await connectDB.execute(
        "SELECT * FROM shifts WHERE employee_id = ? AND id != ? AND ((start_time <= ? AND end_time >= ?) OR (start_time >= ? AND start_time <= ?))",
        [
          this.employee_id,
          this.id || 0,
          this.end_time,
          this.start_time,
          this.start_time,
          this.end_time,
        ]
      );
      return rows.length > 0;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification des chevauchements:",
        error
      );
      throw error;
    }
  }

  async save() {
    try {
      // Mettre à jour la date de modification
      this.updated_at = new Date();

      if (this.id) {
        // Mise à jour
        await connectDB.execute(
          "UPDATE shifts SET employee_id = ?, start_time = ?, end_time = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?",
          [
            this.employee_id,
            this.start_time,
            this.end_time,
            this.status,
            this.notes,
            this.updated_at,
            this.id,
          ]
        );
        return this;
      } else {
        // Création
        const [result] = await connectDB.execute(
          "INSERT INTO shifts (employee_id, start_time, end_time, created_by, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            this.employee_id,
            this.start_time,
            this.end_time,
            this.created_by,
            this.status,
            this.notes,
            this.created_at,
            this.updated_at,
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du shift:", error);
      throw error;
    }
  }

  static async create(shiftData) {
    try {
      const shift = new Shift(shiftData);
      return await shift.save();
    } catch (error) {
      console.error("Erreur lors de la création du shift:", error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      if (!id) {
        throw new Error("ID de shift non valide");
      }

      const shift = await this.findById(id);
      if (!shift) {
        return null;
      }

      // Mettre à jour les propriétés
      Object.assign(shift, updateData);

      // Enregistrer les modifications
      await shift.save();

      return shift;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du shift ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await connectDB.execute("DELETE FROM shifts WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du shift ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Shift;
