/**
 * Script pour créer un employé de test
 *
 * Ce script crée un nouvel employé directement avec le modèle, sans passer par l'API
 */

const Employee = require("../models/Employee");
const db = require("../config/db");

async function createTestEmployee() {
  try {
    console.log("Création d'un employé de test...");

    // Données de l'employé de test avec zipCode au format camelCase
    const employeeData = {
      first_name: "Olivier",
      last_name: "Durand",
      email: "odurand" + Math.floor(Math.random() * 1000) + "@example.com", // Email unique
      phone: "0712345678",
      address: "15 rue des Fleurs",
      city: "Lyon",
      zipCode: "69003", // Intentionnellement en camelCase pour tester
      department: "Marketing",
      role: "Chef de projet",
      birthdate: "1985-07-22",
      hire_date: "2019-03-15",
      contractHours: 35,
      status: "active",
      // Simuler un utilisateur admin (à remplacer par un ID valide)
      user_id: 1,
      manager_id: 1,
    };

    console.log("Données pour le nouvel employé:", employeeData);

    // Patch pour désactiver les notifications dans le modèle Employee
    const originalSaveMethod = Employee.prototype.save;
    Employee.prototype.save = async function () {
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
          // code pour mise à jour (non utilisé dans ce test)
          return this;
        } else {
          // Création
          console.log(
            "Insertion d'un nouvel employé (version simplifiée sans notifications)"
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
            this.user_id,
            this.created_at,
            this.updated_at,
          ];

          console.log(
            "Paramètres SQL pour l'insertion:",
            JSON.stringify(params, null, 2)
          );

          // Requête SQL
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
              user_id,
              created_at, 
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          console.log(
            "Requête SQL pour l'insertion (sans notifications):",
            insertQuery
          );

          const [result] = await db.execute(insertQuery, params);
          this.id = result.insertId;

          console.log(`✅ Employé créé avec l'ID: ${this.id}`);
          return this;
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'insertion de l'employé:", error);
        throw error;
      }
    };

    // Créer l'employé en utilisant le modèle patché
    const newEmployee = new Employee(employeeData);
    const result = await newEmployee.save();

    // Restaurer la méthode originale
    Employee.prototype.save = originalSaveMethod;

    console.log("✅ Employé créé avec succès:", result);
    return result;
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'employé:", error);
    throw error;
  } finally {
    // Fermer la connexion à la base de données
    await db.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createTestEmployee()
    .then((employee) => {
      console.log(`Employé créé avec l'ID: ${employee.id}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur:", error);
      process.exit(1);
    });
}

module.exports = createTestEmployee;
