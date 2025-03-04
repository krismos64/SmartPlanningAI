const connectDB = require("../config/db");

class Employee {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email || null;
    this.role = data.role || null;
    this.department = data.department || null;
    this.contract_hours =
      data.contract_hours !== undefined ? data.contract_hours : 0;
    this.birth_date = data.birth_date || null;
    this.start_date = data.start_date || null;
    this.status = data.status || "active";
    this.hours_worked = data.hours_worked !== undefined ? data.hours_worked : 0;
    this.overtime_hours =
      data.overtime_hours !== undefined ? data.overtime_hours : 0;
    this.created_at = data.created_at;

    // Log des données reçues et initialisées
    console.log(
      "Données reçues dans le constructeur Employee:",
      JSON.stringify(data)
    );
    console.log("Objet Employee initialisé:", JSON.stringify(this));
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
      // Formater les dates pour MySQL si nécessaire
      let birth_date = this.birth_date;
      let start_date = this.start_date;

      // Formater la date de naissance
      if (
        birth_date &&
        typeof birth_date === "string" &&
        birth_date.includes("T")
      ) {
        try {
          const date = new Date(birth_date);
          birth_date = date.toISOString().split("T")[0];
          console.log(`Date de naissance formatée dans save(): ${birth_date}`);
        } catch (error) {
          console.error(
            "Erreur lors du formatage de la date de naissance dans save():",
            error
          );
        }
      }

      // Formater la date de début
      if (
        start_date &&
        typeof start_date === "string" &&
        start_date.includes("T")
      ) {
        try {
          const date = new Date(start_date);
          start_date = date.toISOString().split("T")[0];
          console.log(`Date de début formatée dans save(): ${start_date}`);
        } catch (error) {
          console.error(
            "Erreur lors du formatage de la date de début dans save():",
            error
          );
        }
      }

      console.log("Données de l'employé à sauvegarder:", {
        id: this.id,
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        role: this.role,
        department: this.department,
        contract_hours: this.contract_hours,
        birth_date: birth_date,
        start_date: start_date,
        status: this.status,
        hours_worked: this.hours_worked,
        overtime_hours: this.overtime_hours,
      });

      if (this.id) {
        // Mise à jour
        console.log(
          `Exécution de la requête UPDATE pour l'employé ID ${this.id}`
        );
        try {
          // S'assurer que toutes les valeurs sont correctement définies
          const params = [
            this.first_name,
            this.last_name,
            this.email,
            this.role,
            this.department,
            this.contract_hours !== undefined ? this.contract_hours : 0,
            birth_date,
            start_date,
            this.status || "active",
            this.hours_worked !== undefined ? this.hours_worked : 0,
            this.overtime_hours !== undefined ? this.overtime_hours : 0,
            this.id,
          ];

          console.log("Paramètres de la requête UPDATE:", params);

          await connectDB.execute(
            "UPDATE employees SET first_name = ?, last_name = ?, email = ?, role = ?, department = ?, contract_hours = ?, birth_date = ?, start_date = ?, status = ?, hours_worked = ?, overtime_hours = ? WHERE id = ?",
            params
          );
          console.log(`Mise à jour réussie pour l'employé ID ${this.id}`);
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
        console.log("Tentative d'insertion d'un nouvel employé");
        const [result] = await connectDB.execute(
          "INSERT INTO employees (first_name, last_name, email, role, department, contract_hours, birth_date, start_date, status, hours_worked, overtime_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            this.first_name,
            this.last_name,
            this.email,
            this.role || null,
            this.department || null,
            this.contract_hours || 0,
            this.birth_date,
            this.start_date,
            this.status || "active",
            this.hours_worked || 0,
            this.overtime_hours || 0,
          ]
        );
        this.id = result.insertId;
        console.log("Employé créé avec succès, ID:", this.id);
        return this;
      }
    } catch (error) {
      console.error(
        "Erreur détaillée lors de l'enregistrement de l'employé:",
        error
      );
      console.error("Message d'erreur:", error.message);
      console.error("Code d'erreur SQL:", error.code);
      console.error("Numéro d'erreur SQL:", error.errno);
      console.error("État SQL:", error.sqlState);
      throw error;
    }
  }

  static async create(employeeData) {
    try {
      console.log("Données reçues dans create():", employeeData);
      const employee = new Employee(employeeData);
      return await employee.save();
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      console.log(
        `Tentative de mise à jour de l'employé ${id} avec les données:`,
        JSON.stringify(updateData)
      );

      // Vérifier si l'ID est valide
      if (!id) {
        console.error("ID d'employé non valide:", id);
        throw new Error("ID d'employé non valide");
      }

      const employee = await this.findById(id);
      if (!employee) {
        console.log(`Employé avec ID ${id} non trouvé`);
        return null;
      }

      console.log(`Employé trouvé:`, JSON.stringify(employee));

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
        contract_hours:
          updateData.contract_hours !== undefined
            ? updateData.contract_hours
            : employee.contract_hours,
        birth_date: updateData.birth_date,
        start_date: updateData.start_date,
        status: updateData.status || employee.status || "active",
        hours_worked:
          updateData.hours_worked !== undefined
            ? updateData.hours_worked
            : employee.hours_worked,
        overtime_hours:
          updateData.overtime_hours !== undefined
            ? updateData.overtime_hours
            : employee.overtime_hours,
      };

      // Formater les dates correctement pour MySQL
      if (cleanedData.birth_date) {
        try {
          // Vérifier si la date est au format ISO
          if (cleanedData.birth_date.includes("T")) {
            // Convertir la date ISO en format YYYY-MM-DD
            const date = new Date(cleanedData.birth_date);
            cleanedData.birth_date = date.toISOString().split("T")[0];
          }
          console.log(`Date de naissance formatée: ${cleanedData.birth_date}`);
        } catch (dateError) {
          console.error(
            "Erreur lors du formatage de la date de naissance:",
            dateError
          );
          cleanedData.birth_date = employee.birth_date; // Utiliser l'ancienne valeur en cas d'erreur
        }
      }

      if (cleanedData.start_date) {
        try {
          // Vérifier si la date est au format ISO
          if (cleanedData.start_date.includes("T")) {
            // Convertir la date ISO en format YYYY-MM-DD
            const date = new Date(cleanedData.start_date);
            cleanedData.start_date = date.toISOString().split("T")[0];
          }
          console.log(`Date de début formatée: ${cleanedData.start_date}`);
        } catch (dateError) {
          console.error(
            "Erreur lors du formatage de la date de début:",
            dateError
          );
          cleanedData.start_date = employee.start_date; // Utiliser l'ancienne valeur en cas d'erreur
        }
      }

      console.log(
        `Données nettoyées pour la mise à jour:`,
        JSON.stringify(cleanedData)
      );

      // Mettre à jour les propriétés
      Object.assign(employee, cleanedData);

      console.log(
        `Employé après fusion des données:`,
        JSON.stringify(employee)
      );

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
