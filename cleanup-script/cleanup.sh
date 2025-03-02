#!/bin/bash

# Sauvegarde de la taille initiale
INITIAL_SIZE=$(du -sh node_modules | cut -f1)

echo "Taille initiale de node_modules: $INITIAL_SIZE"

# Suppression du cache
echo "Suppression du cache..."
rm -rf node_modules/.cache

# Suppression des dossiers de tests
echo "Suppression des dossiers de tests..."
find node_modules -type d -name "test" -o -name "tests" -o -name "__tests__" | xargs rm -rf

# Suppression des dossiers de documentation
echo "Suppression des dossiers de documentation..."
find node_modules -type d -name "docs" -o -name "doc" -o -name "examples" | xargs rm -rf

# Suppression des fichiers markdown
echo "Suppression des fichiers markdown..."
find node_modules -type f -name "*.md" | xargs rm -f

# Suppression des fichiers de licence
echo "Suppression des fichiers de licence..."
find node_modules -type f -name "LICENSE*" -o -name "LICENCE*" | xargs rm -f

# Suppression des fichiers TypeScript source (on garde les .d.ts)
echo "Suppression des fichiers TypeScript source..."
find node_modules -type f -name "*.ts" -not -name "*.d.ts" | xargs rm -f

# Taille finale
FINAL_SIZE=$(du -sh node_modules | cut -f1)
echo "Taille finale de node_modules: $FINAL_SIZE"
echo "Nettoyage terminé!" 