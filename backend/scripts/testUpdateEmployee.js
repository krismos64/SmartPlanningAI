/**
 * Script pour tester la mise à jour d'un employé
 *
 * Ce script teste la fonction de mise à jour d'un employé avec différentes valeurs de champs
 */

const Employee = require("../models/Employee");
const db = require("../config/db");

async function testUpdateEmployee() {
  try {
    console.log("Test de mise à jour d'un employé...");

    // ID de l'employé à mettre à jour - à remplacer par un ID valide
    const employeeId = 6;

    // Récupérer l'employé existant
    const existingEmployee = await Employee.findById(employeeId);

    if (!existingEmployee) {
      console.error(`❌ L'employé avec l'ID ${employeeId} n'existe pas.`);
      return;
    }

    console.log(
      `✅ Employé trouvé: ${existingEmployee.first_name} ${existingEmployee.last_name} (ID: ${existingEmployee.id})`
    );

    // Données de mise à jour - y compris contractHours en string pour tester la conversion
    const updateData = {
      first_name: existingEmployee.first_name,
      last_name: existingEmployee.last_name,
      email: existingEmployee.email,
      phone: existingEmployee.phone,
      address: existingEmployee.address,
      city: existingEmployee.city,
      zipCode: existingEmployee.zip_code || "64000", // Utiliser zipCode en format camelCase pour tester la conversion
      department: existingEmployee.department,
      role: existingEmployee.role,
      birthdate: existingEmployee.birthdate,
      hire_date: existingEmployee.hire_date,
      contractHours: "35.00", // Intentionnellement en string pour tester la conversion
      status: existingEmployee.status,
      user_id: existingEmployee.user_id,
      manager_id: existingEmployee.manager_id,
    };

    console.log(
      "Données pour la mise à jour:",
      JSON.stringify(updateData, null, 2)
    );

    // Mettre à jour l'employé
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData
    );

    if (!updatedEmployee) {
      console.error("❌ Échec de la mise à jour de l'employé.");
      return;
    }

    console.log("✅ Employé mis à jour avec succès:", {
      id: updatedEmployee.id,
      first_name: updatedEmployee.first_name,
      last_name: updatedEmployee.last_name,
      contractHours: updatedEmployee.contractHours,
      zipCode: updatedEmployee.zip_code,
    });

    return updatedEmployee;
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'employé:", error);
    throw error;
  } finally {
    // Fermer la connexion à la base de données
    await db.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  testUpdateEmployee()
    .then(() => {
      console.log("Test terminé avec succès.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur:", error);
      process.exit(1);
    });
}

module.exports = testUpdateEmployee;
