/**
 * Script pour identifier les appels problématiques au service de notification
 *
 * Ce script recherche tous les appels à createAndEmitNotification qui peuvent causer des erreurs
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Liste des répertoires où chercher
const directories = [
  path.join(__dirname, "../models"),
  path.join(__dirname, "../controllers"),
  path.join(__dirname, "../services"),
  path.join(__dirname, "../routes"),
];

// Motif problématique à rechercher
const problematicPattern =
  /(await\s+createAndEmitNotification\()([^{]+)(,\s*{)/g;
const correctedPattern = "$1null$3";

// Format du message pour les développeurs
function generateFixMessage(filePath, line, original, suggested) {
  return `
  Fichier: ${filePath}
  Ligne: ${line}
  Avant: ${original.trim()}
  Après: ${suggested.trim()}
  `;
}

// Recherche récursive dans un répertoire
async function searchDirectory(directory) {
  const fileNames = fs.readdirSync(directory);
  const results = [];

  for (const fileName of fileNames) {
    const filePath = path.join(directory, fileName);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recherche récursive dans les sous-répertoires
      results.push(...(await searchDirectory(filePath)));
    } else if (fileName.endsWith(".js")) {
      // Chercher dans les fichiers JavaScript
      const content = await readFile(filePath, "utf8");
      let match;
      let lineNumber = 1;
      let found = false;

      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.includes("createAndEmitNotification(") &&
          !line.includes("null,") &&
          line.includes(".io,")
        ) {
          found = true;
          const original = line;
          const suggested = line.replace(
            /(createAndEmitNotification\()([^{]+)(,\s*{)/g,
            "createAndEmitNotification(null$3"
          );

          results.push({
            filePath,
            lineNumber: i + 1,
            original,
            suggested,
          });
        }
      }
    }
  }

  return results;
}

// Fonction principale
async function main() {
  console.log(
    "Recherche des appels problématiques à createAndEmitNotification..."
  );

  let allResults = [];
  for (const directory of directories) {
    const results = await searchDirectory(directory);
    allResults.push(...results);
  }

  if (allResults.length === 0) {
    console.log("✅ Aucun appel problématique trouvé!");
  } else {
    console.log(`⚠️ ${allResults.length} appel(s) problématique(s) trouvé(s):`);

    // Générer un rapport avec les corrections suggérées
    let report = "# RAPPORT DE CORRECTIONS POUR LE SERVICE DE NOTIFICATION\n\n";
    report +=
      "Les appels suivants à createAndEmitNotification() doivent être corrigés :\n\n";

    allResults.forEach((result) => {
      report += generateFixMessage(
        result.filePath,
        result.lineNumber,
        result.original,
        result.suggested
      );
      report += "\n---\n";
    });

    // Sauvegarder le rapport
    const reportPath = path.join(__dirname, "notification_fix_report.md");
    await writeFile(reportPath, report);

    console.log(`Rapport sauvegardé dans: ${reportPath}`);
    console.log(
      "Veuillez effectuer les corrections manuellement ou utilisez le mode automatique."
    );
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Erreur lors de l'exécution du script:", error);
    process.exit(1);
  });
}

module.exports = { searchDirectory };
