const mysql = require("mysql2/promise");
const connectDB = require("../config/db");

class Employee {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.role = data.role;
    this.department = data.department;
    this.hours_worked = data.hours_worked || 0;
    this.overtime_hours = data.overtime_hours || 0;
    this.created_at = data.created_at;
  }

  static async find() {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute("SELECT * FROM employees");
      return rows.map((row) => new Employee(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const connection = await connectDB();
      const [rows] = await connection.execute(
        "SELECT * FROM employees WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return new Employee(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'employé ${id}:`,
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
          "UPDATE employees SET first_name = ?, last_name = ?, email = ?, role = ?, department = ?, hours_worked = ?, overtime_hours = ? WHERE id = ?",
          [
            this.first_name,
            this.last_name,
            this.email,
            this.role,
            this.department,
            this.hours_worked || 0,
            this.overtime_hours || 0,
            this.id,
          ]
        );
        return this;
      } else {
        // Création
        const [result] = await connection.execute(
          "INSERT INTO employees (first_name, last_name, email, role, department, hours_worked, overtime_hours) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            this.first_name,
            this.last_name,
            this.email,
            this.role,
            this.department,
            this.hours_worked || 0,
            this.overtime_hours || 0,
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'employé:", error);
      throw error;
    }
  }

  static async create(employeeData) {
    try {
      const employee = new Employee(employeeData);
      return await employee.save();
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      const employee = await this.findById(id);
      if (!employee) return null;

      // Mettre à jour les propriétés
      Object.assign(employee, updateData);

      // Enregistrer les modifications
      await employee.save();

      return employee;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const connection = await connectDB();
      await connection.execute("DELETE FROM employees WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Employee;
