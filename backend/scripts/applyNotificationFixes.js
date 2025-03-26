/**
 * Script pour appliquer automatiquement les corrections aux appels problématiques du service de notification
 *
 * Ce script prend le rapport généré par fixNotificationService.js et applique les corrections suggérées
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { searchDirectory } = require("./fixNotificationService");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Fonction pour appliquer les corrections à un fichier
async function applyFixesToFile(filePath, corrections) {
  // Lire le contenu du fichier
  const content = await readFile(filePath, "utf8");

  // Diviser le contenu en lignes pour appliquer les corrections ligne par ligne
  const lines = content.split("\n");

  // Trier les corrections par numéro de ligne (décroissant) pour éviter de perturber les indices de ligne
  corrections.sort((a, b) => b.lineNumber - a.lineNumber);

  // Appliquer les corrections
  corrections.forEach((correction) => {
    // Lignes sont indexées à partir de 0, mais les numéros de ligne commencent à 1
    const lineIndex = correction.lineNumber - 1;

    if (lineIndex >= 0 && lineIndex < lines.length) {
      const original = lines[lineIndex];

      // Vérifier que la ligne correspond à ce que nous attendons
      if (
        original.includes("createAndEmitNotification(") &&
        original.includes(".io,")
      ) {
        const corrected = original.replace(
          /(createAndEmitNotification\()([^{]+)(,\s*{)/g,
          "createAndEmitNotification(null$3"
        );

        lines[lineIndex] = corrected;
        console.log(
          `Corrigé dans ${filePath}:\n  Ligne ${
            correction.lineNumber
          }: ${original.trim()} -> ${corrected.trim()}`
        );
      } else {
        console.warn(
          `⚠️ La ligne ${correction.lineNumber} dans ${filePath} ne correspond pas à ce qui était attendu.`
        );
      }
    } else {
      console.warn(
        `⚠️ Ligne ${correction.lineNumber} hors limites dans ${filePath}`
      );
    }
  });

  // Reconstituer le contenu du fichier
  const updatedContent = lines.join("\n");

  // Écrire le fichier mis à jour
  await writeFile(filePath, updatedContent, "utf8");
  console.log(`✅ Fichier mis à jour: ${filePath}`);
}

// Fonction principale
async function main() {
  console.log(
    "Recherche des appels problématiques à createAndEmitNotification..."
  );

  // Liste des répertoires où chercher
  const directories = [
    path.join(__dirname, "../models"),
    path.join(__dirname, "../controllers"),
    path.join(__dirname, "../services"),
    path.join(__dirname, "../routes"),
  ];

  // Collecter tous les résultats
  let allResults = [];
  for (const directory of directories) {
    const results = await searchDirectory(directory);
    allResults.push(...results);
  }

  if (allResults.length === 0) {
    console.log("✅ Aucun appel problématique trouvé!");
    return;
  }

  console.log(`⚠️ ${allResults.length} appel(s) problématique(s) trouvé(s).`);

  // Regrouper les corrections par fichier
  const correctionsByFile = {};
  allResults.forEach((result) => {
    if (!correctionsByFile[result.filePath]) {
      correctionsByFile[result.filePath] = [];
    }
    correctionsByFile[result.filePath].push(result);
  });

  // Appliquer les corrections fichier par fichier
  console.log("Application des corrections...");
  for (const filePath in correctionsByFile) {
    await applyFixesToFile(filePath, correctionsByFile[filePath]);
  }

  console.log("✅ Toutes les corrections ont été appliquées.");
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Erreur lors de l'application des corrections:", error);
    process.exit(1);
  });
}

module.exports = { applyFixesToFile };
