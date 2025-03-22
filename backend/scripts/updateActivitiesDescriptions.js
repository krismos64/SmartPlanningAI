const db = require("../config/db");
const Activity = require("../models/Activity");

/**
 * Script pour mettre à jour les descriptions des activités de suppression de congés
 */
async function updateVacationDeleteActivities() {
  try {
    console.log(
      "Démarrage de la mise à jour des descriptions des activités de suppression de congés..."
    );

    // Récupérer toutes les activités de suppression de congés
    const [activities] = await db.query(`
      SELECT a.*, u.first_name, u.last_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.type = 'delete' AND a.entity_type = 'vacation'
    `);

    console.log(
      `${activities.length} activités de suppression de congés trouvées.`
    );

    let updatedCount = 0;

    // Parcourir chaque activité et mettre à jour sa description
    for (const activity of activities) {
      let details = {};
      try {
        details =
          typeof activity.details === "string"
            ? JSON.parse(activity.details)
            : activity.details || {};
      } catch (e) {
        console.error(
          `Erreur lors du parsing des détails pour l'activité ${activity.id}:`,
          e
        );
        details = {};
      }

      // Générer la nouvelle description
      const userName =
        activity.first_name && activity.last_name
          ? `${activity.first_name} ${activity.last_name}`
          : "Un utilisateur";

      const employeeName = details.employee_name
        ? details.employee_name
        : details.employee_id
        ? `Employé #${details.employee_id}`
        : `#${activity.entity_id}`;

      let dateRange = "";
      if (details.start_date && details.end_date) {
        const startDate = new Date(details.start_date).toLocaleDateString(
          "fr-FR"
        );
        const endDate = new Date(details.end_date).toLocaleDateString("fr-FR");
        dateRange = ` du ${startDate} au ${endDate}`;
      }

      const newDescription = `${userName} a supprimé la demande de congé pour ${employeeName}${dateRange}`;

      // Mettre à jour la description dans la base de données
      const [updateResult] = await db.query(
        `UPDATE activities SET description = ? WHERE id = ?`,
        [newDescription, activity.id]
      );

      if (updateResult.affectedRows > 0) {
        updatedCount++;
        console.log(
          `✅ Activité #${activity.id} mise à jour: ${newDescription}`
        );
      }
    }

    console.log(
      `Mise à jour terminée. ${updatedCount}/${activities.length} activités mises à jour avec succès.`
    );
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des descriptions des activités:",
      error
    );
  } finally {
    process.exit(0);
  }
}

// Exécuter le script
updateVacationDeleteActivities();
