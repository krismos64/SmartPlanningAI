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
    this.phone = data.phone || null;
    this.address = data.address || null;
    this.city = data.city || null;
    this.zip_code = data.zip_code || data.zipCode || null;
    this.role = data.role || null;
    this.department = data.department || null;
    this.contractHours = data.contract_hours || data.contractHours || 35; // Support des deux formats
    this.birthdate = data.birthdate || null;
    this.hire_date = data.hire_date || null;
    this.status = data.status || "active";
    this.hour_balance = data.hour_balance || 0; // Ajout du solde d'heures
    this.manager_id = data.manager_id || null; // Ajout de l'ID du manager
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
      // Log des données de l'employé pour le débogage
      console.log(
        "Données de l'employé à enregistrer:",
        JSON.stringify(
          {
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            city: this.city,
            zip_code: this.zip_code,
            role: this.role,
            department: this.department,
            contractHours: this.contractHours,
            birthdate: this.birthdate,
            hire_date: this.hire_date,
            status: this.status,
            manager_id: this.manager_id,
          },
          null,
          2
        )
      );

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
            this.phone,
            this.address,
            this.city,
            this.zip_code,
            this.role,
            this.department,
            this.contractHours !== undefined ? this.contractHours : 35,
            birth_date,
            start_date,
            this.status || "active",
            this.manager_id,
            this.updated_at,
            this.id,
          ];

          console.log(
            "Paramètres SQL pour la mise à jour:",
            JSON.stringify(params, null, 2)
          );

          // Requête SQL explicite sans hourlyRate
          const updateQuery = `
            UPDATE employees 
            SET first_name = ?, 
                last_name = ?, 
                email = ?, 
                phone = ?, 
                address = ?, 
                city = ?, 
                zip_code = ?, 
                role = ?, 
                department = ?, 
                contractHours = ?, 
                birthdate = ?, 
                hire_date = ?, 
                status = ?,
                manager_id = ?,
                updated_at = ? 
            WHERE id = ?
          `;

          console.log("Requête SQL pour la mise à jour:", updateQuery);

          await connectDB.execute(updateQuery, params);
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
        try {
          console.log(
            "Données pour insertion:",
            JSON.stringify(
              {
                first_name: this.first_name,
                last_name: this.last_name,
                email: this.email,
                phone: this.phone,
                address: this.address,
                city: this.city,
                zip_code: this.zip_code,
                role: this.role,
                department: this.department,
                contractHours: this.contractHours,
                birthdate: birth_date,
                hire_date: start_date,
                status: this.status,
                manager_id: this.manager_id,
              },
              null,
              2
            )
          );

          const params = [
            this.first_name || null,
            this.last_name || null,
            this.email || null,
            this.phone || null,
            this.address || null,
            this.city || null,
            this.zip_code || null,
            this.role,
            this.department,
            this.contractHours !== undefined ? this.contractHours : 35,
            birth_date,
            start_date,
            this.status || "active",
            this.manager_id,
            this.created_at,
            this.updated_at,
          ];

          console.log(
            "Paramètres SQL pour l'insertion:",
            JSON.stringify(params, null, 2)
          );

          // Requête SQL explicite sans hourlyRate
          const insertQuery = `
            INSERT INTO employees (
              first_name, 
              last_name, 
              email, 
              phone, 
              address, 
              city, 
              zip_code, 
              role, 
              department, 
              contractHours, 
              birthdate, 
              hire_date, 
              status,
              manager_id,
              created_at, 
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          console.log("Requête SQL pour l'insertion:", insertQuery);

          const [result] = await connectDB.execute(insertQuery, params);
          this.id = result.insertId;
          return this;
        } catch (insertError) {
          console.error(
            "Erreur SQL lors de l'insertion d'un nouvel employé:",
            insertError
          );
          console.error("Message d'erreur:", insertError.message);
          console.error("Code d'erreur:", insertError.code);
          console.error("Numéro d'erreur SQL:", insertError.errno);
          console.error("État SQL:", insertError.sqlState);
          throw insertError;
        }
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

      console.log(
        "Données brutes reçues pour la mise à jour:",
        JSON.stringify(updateData, null, 2)
      );

      const employee = await this.findById(id);
      if (!employee) {
        return null;
      }

      console.log(
        "Employé avant mise à jour:",
        JSON.stringify(
          {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone,
            address: employee.address,
            city: employee.city,
            zip_code: employee.zip_code,
          },
          null,
          2
        )
      );

      // Vérifier et nettoyer les données avant la mise à jour
      // Utiliser les valeurs existantes comme fallback
      const cleanedData = {
        first_name: updateData.first_name || employee.first_name,
        last_name: updateData.last_name || employee.last_name,
        email:
          updateData.email !== undefined ? updateData.email : employee.email,
        // Correction pour les champs problématiques
        phone: updateData.phone || null,
        address: updateData.address || null,
        city: updateData.city || null,
        zip_code: updateData.zip_code || null,
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
        updated_at: new Date(), // Mettre à jour la date de modification
      };

      console.log(
        "Données nettoyées pour la mise à jour:",
        JSON.stringify(cleanedData, null, 2)
      );

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

      console.log(
        "Employé après mise à jour:",
        JSON.stringify(
          {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone,
            address: employee.address,
            city: employee.city,
            zip_code: employee.zip_code,
          },
          null,
          2
        )
      );

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

  static async updateHourBalance(employeeId) {
    try {
      const [result] = await connectDB.execute(
        `SELECT SUM(balance) AS total_balance 
         FROM work_hours WHERE employee_id = ?`,
        [employeeId]
      );

      const totalBalance = result[0]?.total_balance || 0;

      await connectDB.execute(
        "UPDATE employees SET hour_balance = ? WHERE id = ?",
        [totalBalance, employeeId]
      );

      return totalBalance;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du compteur horaire :",
        error
      );
      throw error;
    }
  }

  static async findByManager(managerId) {
    try {
      console.log(`Récupération des employés pour le manager ID: ${managerId}`);
      const [rows] = await connectDB.execute(
        "SELECT * FROM employees WHERE manager_id = ?",
        [managerId]
      );
      console.log(
        `${rows.length} employés trouvés pour le manager ID: ${managerId}`
      );
      return rows.map((row) => new Employee(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des employés pour le manager ${managerId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = Employee;
