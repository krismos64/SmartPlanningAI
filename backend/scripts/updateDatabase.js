const mongoose = require("mongoose");
const Shift = require("../models/Shift");
require("dotenv").config();

const updateDatabase = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connexion à la base de données établie");

    // Créer les index pour la collection shifts
    await Shift.collection.createIndex({
      employee: 1,
      startTime: 1,
      endTime: 1,
    });
    await Shift.collection.createIndex({ status: 1 });

    console.log("Index créés avec succès");

    // Vérifier si la collection shifts existe
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const shiftsExists = collections.some((col) => col.name === "shifts");

    if (!shiftsExists) {
      console.log("Collection shifts créée");
    } else {
      console.log("Collection shifts existe déjà");
    }

    console.log("Mise à jour de la base de données terminée avec succès");
    process.exit(0);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la base de données:",
      error
    );
    process.exit(1);
  }
};

updateDatabase();
