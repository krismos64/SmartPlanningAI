const connectDB = require("../config/db");

class VacationRequest {
  constructor(data) {
    this.id = data.id;
    this.employee_id = data.employee_id;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.reason = data.reason;
    this.status = data.status;
    this.approved_by = data.approved_by;
    this.approved_at = data.approved_at;
    this.rejected_by = data.rejected_by;
    this.rejected_at = data.rejected_at;
    this.created_at = data.created_at;
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute("SELECT * FROM vacation_requests");
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
        "SELECT * FROM vacation_requests WHERE id = ?",
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

  async save() {
    try {
      if (this.id) {
        // Mise à jour
        await connectDB.execute(
          "UPDATE vacation_requests SET employee_id = ?, start_date = ?, end_date = ?, reason = ?, status = ?, approved_by = ?, approved_at = ?, rejected_by = ?, rejected_at = ? WHERE id = ?",
          [
            this.employee_id,
            this.start_date,
            this.end_date,
            this.reason,
            this.status,
            this.approved_by,
            this.approved_at,
            this.rejected_by,
            this.rejected_at,
            this.id,
          ]
        );
        return this;
      } else {
        // Création
        const [result] = await connectDB.execute(
          "INSERT INTO vacation_requests (employee_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)",
          [
            this.employee_id,
            this.start_date,
            this.end_date,
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
}

module.exports = VacationRequest;
