const { createActivitiesTable } = require("./create_activities_table");
const { createShiftsTable } = require("./create_shifts_table");

async function runMigrations() {
  try {
    console.log("Démarrage des migrations...");

    // Exécuter la migration pour la table des activités
    await createActivitiesTable();

    // Exécuter la migration pour la table des shifts
    await createShiftsTable();

    // Ajouter d'autres migrations ici si nécessaire

    console.log("Toutes les migrations ont été exécutées avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'exécution des migrations:", error);
    process.exit(1);
  }
}

// Exécuter les migrations si ce script est appelé directement
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
