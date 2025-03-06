const db = require("../config/db");

/**
 * Script pour insérer des données de test dans la table activities
 */
async function seedActivities() {
  try {
    console.log("Insertion de données de test dans la table activities...");

    // Vérifier si la table contient déjà des données
    const [existingActivities] = await db.query(
      "SELECT COUNT(*) as count FROM activities"
    );

    if (existingActivities[0].count > 0) {
      console.log(
        `La table activities contient déjà ${existingActivities[0].count} enregistrements.`
      );
      console.log("Voulez-vous ajouter plus de données? (Ctrl+C pour annuler)");
    }

    // Récupérer quelques utilisateurs pour les activités
    const [users] = await db.query(
      "SELECT id, username, first_name, last_name FROM users LIMIT 5"
    );

    if (users.length === 0) {
      console.error(
        "Aucun utilisateur trouvé. Veuillez d'abord créer des utilisateurs."
      );
      process.exit(1);
    }

    // Types d'activités
    const activityTypes = ["create", "update", "delete", "approve", "reject"];

    // Descriptions d'activités
    const activityDescriptions = [
      "a créé un nouvel employé",
      "a modifié les informations d'un employé",
      "a supprimé un employé",
      "a approuvé une demande de congé",
      "a rejeté une demande de congé",
      "a créé un nouveau planning",
      "a modifié un planning",
      "a supprimé un planning",
      "a connecté au système",
      "a généré un rapport",
    ];

    // Détails d'activités (exemples)
    const activityDetails = [
      {
        entity_id: 1,
        entity_type: "employee",
        changes: { name: "John Doe", position: "Developer" },
      },
      {
        entity_id: 2,
        entity_type: "vacation",
        changes: { start_date: "2023-06-15", end_date: "2023-06-20" },
      },
      {
        entity_id: 3,
        entity_type: "schedule",
        changes: { week: "2023-06-12", hours: 40 },
      },
      {
        entity_id: 4,
        entity_type: "report",
        changes: { type: "monthly", period: "June 2023" },
      },
    ];

    // Générer 20 activités aléatoires
    const activities = [];

    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type =
        activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const description = `${user.first_name} ${user.last_name} ${
        activityDescriptions[
          Math.floor(Math.random() * activityDescriptions.length)
        ]
      }`;
      const details =
        activityDetails[Math.floor(Math.random() * activityDetails.length)];

      // Date aléatoire dans les 30 derniers jours
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      activities.push([
        type,
        description,
        user.id,
        JSON.stringify(details),
        date.toISOString().slice(0, 19).replace("T", " "), // Format MySQL datetime
      ]);
    }

    // Insérer les activités dans la base de données
    const insertQuery = `
      INSERT INTO activities (type, description, user_id, details, timestamp)
      VALUES ?
    `;

    const [result] = await db.query(insertQuery, [activities]);

    console.log(
      `✅ ${result.affectedRows} activités ont été insérées avec succès.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion des données de test:", error);
    process.exit(1);
  }
}

// Exécuter le script
seedActivities();
