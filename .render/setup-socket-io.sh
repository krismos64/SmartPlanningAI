#!/bin/bash

# Script post-déploiement pour Render

echo "Vérification de socket.io..."

# Vérifier si socket.io est installé
if ! npm list socket.io --depth=0 2>/dev/null | grep -q socket.io; then
  echo "socket.io n'est pas installé, installation en cours..."
  npm install socket.io --save
  echo "socket.io installé avec succès!"
else
  echo "socket.io est déjà installé."
fi

# Afficher les dépendances pour vérification
echo "Liste des dépendances installées:"
npm list --depth=0 | grep socket.io 