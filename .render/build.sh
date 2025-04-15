#!/bin/bash

# Script d'installation pour Render

# Afficher la version de Node
echo "Utilisation de Node.js $(node -v)"
echo "Utilisation de npm $(npm -v)"

# Installation des dépendances
echo "Installation des dépendances..."
npm install

# Installer explicitement socket.io
echo "Installation de socket.io..."
npm install socket.io

# Construire l'application
echo "Construction de l'application..."
npm run build

echo "Build terminé avec succès!" 