#!/bin/bash

# Script de déploiement pour SmartPlanningAI

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
  
  # Utiliser le conteneur MySQL pour faire une sauvegarde
  docker exec smartplanning-db mysqldump -u root -p"root_password" SmartPlanningAI > "$BACKUP_DIR/smartplanning_backup_$TIMESTAMP.sql"
  
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
  
  print_step "Construction et démarrage des conteneurs Docker..."
  docker-compose build
  docker-compose up -d
  
  print_step "Vérification de l'état des conteneurs..."
  docker-compose ps
}

# Exécution
print_step "Début du déploiement de SmartPlanningAI"

if docker-compose ps | grep -q "smartplanning-db"; then
  backup_database
fi

deploy

print_step "Déploiement terminé avec succès!" 