#!/bin/bash

# Script exécuté avant le démarrage du serveur

echo "Exécution du script de préparation au démarrage..."

# Vérifier et installer socket.io
echo "Vérification de socket.io avant démarrage du serveur..."
npm list socket.io || npm install socket.io --save

# Vérifier l'existence du module
if [ -d "./node_modules/socket.io" ]; then
  echo "✅ Le module socket.io est bien installé"
else
  echo "❌ ERREUR: Le module socket.io est ABSENT!"
  # Installation forcée
  echo "Installation forcée de socket.io..."
  npm install socket.io --no-save
  npm install socket.io --save
fi

# Lister les fichiers dans le répertoire pour vérification
echo "Contenu du répertoire backend/config:"
ls -la backend/config/

echo "Contenu du fichier websocket.js:"
cat backend/config/websocket.js | head -n 10

echo "Script de préparation terminé." 