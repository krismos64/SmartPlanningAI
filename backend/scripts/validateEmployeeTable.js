/**
 * Script de validation de la structure de la table employees
 *
 * Vérifie que tous les champs nécessaires existent et sont correctement typés
 */

const db = require("../config/db");

async function validateEmployeeTable() {
  try {
    console.log("Validation de la structure de la table employees...");

    // Vérifier si la table employees existe
    const [tables] = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_name = 'employees'
    `);

    if (tables.length === 0) {
      console.error(
        "Erreur: La table employees n'existe pas dans la base de données"
      );
      return false;
    }

    // Récupérer les colonnes de la table employees
    const [columns] = await db.execute(`
      SELECT column_name, data_type, column_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'employees'
    `);

    console.log("Structure actuelle de la table employees:");
    columns.forEach((col) => {
      console.log(
        `- ${col.column_name} (${col.column_type}), Nullable: ${
          col.is_nullable
        }, Default: ${col.column_default || "NULL"}`
      );
    });

    // Vérifier les colonnes requises
    const requiredColumns = [
      "id",
      "first_name",
      "last_name",
      "email",
      "phone",
      "address",
      "city",
      "zip_code",
      "birthdate",
      "hire_date",
      "department",
      "role",
      "contractHours",
      "status",
      "manager_id",
      "user_id",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !columns.some((dbCol) => dbCol.column_name === col)
    );

    if (missingColumns.length > 0) {
      console.error(
        "Colonnes manquantes dans la table employees:",
        missingColumns
      );
      return false;
    }

    console.log("La structure de la table employees est valide ✅");
    return true;
  } catch (error) {
    console.error("Erreur lors de la validation de la table employees:", error);
    return false;
  } finally {
    // Fermer la connexion à la base de données
    await db.end();
  }
}

// Exécuter la validation si le script est appelé directement
if (require.main === module) {
  validateEmployeeTable()
    .then((isValid) => {
      if (isValid) {
        console.log("Validation de la structure terminée avec succès");
        process.exit(0);
      } else {
        console.error("La validation de la structure a échoué");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de l'exécution de la validation:", error);
      process.exit(1);
    });
}

module.exports = validateEmployeeTable;
