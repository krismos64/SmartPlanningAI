#!/bin/bash

# Script de déploiement pour smartplanningai

set -e  # Arrêter le script en cas d'erreur

# Variables
REPOSITORY_URL="https://github.com/votre-utilisateur/SmartPlanningA4.git"
DEPLOYMENT_DIR="/path/to/deployment"
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Fonctions
print_step() {
  echo "====================================================="
  echo ">>> $1"
  echo "====================================================="
}

# Sauvegarder la base de données avant de déployer
backup_database() {
  print_step "Création d'une sauvegarde de la base de données..."
  mkdir -p $BACKUP_DIR
  
  # Sauvegarde MySQL locale
  mysqldump -u root -p smartplanningai > "$BACKUP_DIR/smartplanning_backup_$TIMESTAMP.sql"
  
  echo "Sauvegarde créée : $BACKUP_DIR/smartplanning_backup_$TIMESTAMP.sql"
}

# Déployer l'application
deploy() {
  print_step "Déploiement de l'application..."
  
  if [ ! -d "$DEPLOYMENT_DIR" ]; then
    print_step "Clonage initial du dépôt..."
    git clone $REPOSITORY_URL $DEPLOYMENT_DIR
    cd $DEPLOYMENT_DIR
  else
    cd $DEPLOYMENT_DIR
    print_step "Mise à jour du dépôt..."
    git pull origin main
  fi
  
  print_step "Installation des dépendances et build de l'application..."
  npm install
  npm run build
  
  print_step "Installation des dépendances du backend..."
  cd backend
  npm install
  
  print_step "Redémarrage du service backend..."
  # Si vous utilisez PM2 pour gérer les processus Node.js
  pm2 restart server.js || pm2 start server.js
  
  print_step "Vérification de l'état des services..."
  pm2 status
}

# Exécution
print_step "Début du déploiement de smartplanningai"

# Vérifier si MySQL est en cours d'exécution
if systemctl is-active --quiet mysql; then
  backup_database
fi

deploy

print_step "Déploiement terminé avec succès!" 