const connectDB = require("../config/db");

class Employee {
  constructor(data) {
    // S'assurer que data est un objet
    data = data || {};

    // Initialisation des propriétés
    this.id = data.id;
    this.first_name = data.first_name || null;
    this.last_name = data.last_name || null;
    this.email = data.email || null;
    this.role = data.role || null;
    this.department = data.department || null;
    this.contractHours = data.contract_hours || data.contractHours || 35; // Support des deux formats
    this.birthdate = data.birthdate || null;
    this.hire_date = data.hire_date || null;
    this.status = data.status || "active";
    this.hourlyRate = data.hourly_rate || data.hourlyRate || 0; // Support des deux formats
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date(); // Ajout du champ updated_at
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute("SELECT * FROM employees");
      return rows.map((row) => new Employee(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connectDB.execute(
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
      // Formater les dates pour MySQL
      const birth_date = this.birthdate
        ? new Date(this.birthdate).toISOString().split("T")[0]
        : null;
      const start_date = this.hire_date
        ? new Date(this.hire_date).toISOString().split("T")[0]
        : null;

      // Mettre à jour la date de modification
      this.updated_at = new Date();

      if (this.id) {
        // Mise à jour
        try {
          // S'assurer que toutes les valeurs sont correctement définies
          const params = [
            this.first_name || null,
            this.last_name || null,
            this.email,
            this.role,
            this.department,
            this.contractHours !== undefined ? this.contractHours : 35,
            birth_date,
            start_date,
            this.status || "active",
            this.hourlyRate !== undefined ? this.hourlyRate : 0,
            this.updated_at,
            this.id,
          ];

          await connectDB.execute(
            "UPDATE employees SET first_name = ?, last_name = ?, email = ?, role = ?, department = ?, contractHours = ?, birthdate = ?, hire_date = ?, status = ?, hourlyRate = ?, updated_at = ? WHERE id = ?",
            params
          );
        } catch (updateError) {
          console.error(
            `Erreur SQL lors de la mise à jour de l'employé ID ${this.id}:`,
            updateError
          );
          throw updateError;
        }
        return this;
      } else {
        // Création
        const [result] = await connectDB.execute(
          "INSERT INTO employees (first_name, last_name, email, role, department, contractHours, birthdate, hire_date, status, hourlyRate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            this.first_name || null,
            this.last_name || null,
            this.email,
            this.role,
            this.department,
            this.contractHours !== undefined ? this.contractHours : 35,
            this.birthdate,
            this.hire_date,
            this.status || "active",
            this.hourlyRate !== undefined ? this.hourlyRate : 0,
            this.created_at,
            this.updated_at,
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error(
        "Erreur détaillée lors de l'enregistrement de l'employé:",
        error
      );
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
      // Vérifier si l'ID est valide
      if (!id) {
        throw new Error("ID d'employé non valide");
      }

      const employee = await this.findById(id);
      if (!employee) {
        return null;
      }

      // Vérifier et nettoyer les données avant la mise à jour
      // Utiliser les valeurs existantes comme fallback
      const cleanedData = {
        first_name: updateData.first_name || employee.first_name,
        last_name: updateData.last_name || employee.last_name,
        email:
          updateData.email !== undefined ? updateData.email : employee.email,
        role: updateData.role !== undefined ? updateData.role : employee.role,
        department:
          updateData.department !== undefined
            ? updateData.department
            : employee.department,
        contractHours:
          updateData.contractHours !== undefined
            ? updateData.contractHours
            : employee.contractHours,
        birthdate: updateData.birthdate,
        hire_date: updateData.hire_date,
        status: updateData.status || employee.status || "active",
        hourlyRate:
          updateData.hourlyRate !== undefined
            ? updateData.hourlyRate
            : employee.hourlyRate,
        updated_at: new Date(), // Mettre à jour la date de modification
      };

      // Formater les dates correctement pour MySQL
      if (cleanedData.birthdate) {
        try {
          // Vérifier si la date est au format ISO
          if (cleanedData.birthdate.includes("T")) {
            // Convertir la date ISO en format YYYY-MM-DD
            const date = new Date(cleanedData.birthdate);
            cleanedData.birthdate = date.toISOString().split("T")[0];
          }
        } catch (dateError) {
          cleanedData.birthdate = employee.birthdate; // Utiliser l'ancienne valeur en cas d'erreur
        }
      }

      if (cleanedData.hire_date) {
        try {
          // Vérifier si la date est au format ISO
          if (cleanedData.hire_date.includes("T")) {
            // Convertir la date ISO en format YYYY-MM-DD
            const date = new Date(cleanedData.hire_date);
            cleanedData.hire_date = date.toISOString().split("T")[0];
          }
        } catch (dateError) {
          cleanedData.hire_date = employee.hire_date; // Utiliser l'ancienne valeur en cas d'erreur
        }
      }

      // Mettre à jour les propriétés
      Object.assign(employee, cleanedData);

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
      await connectDB.execute("DELETE FROM employees WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Employee;
