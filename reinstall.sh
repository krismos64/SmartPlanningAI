#!/bin/bash

echo "Ce script nettoiera les caches et réinstallera les dépendances."

# Supprimer les caches et node_modules
rm -rf node_modules
rm -rf ~/.npm
rm -rf .cache

# Vider le cache npm
npm cache clean --force

# Réinstaller les dépendances
npm install --legacy-peer-deps

echo "Installation terminée. Vous pouvez maintenant lancer le projet avec:"  
echo "npm run start:all"

