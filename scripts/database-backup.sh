#!/bin/bash

# Script de sauvegarde automatique pour la base de données smartplanningai

# Variables
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
RETENTION_DAYS=7  # Nombre de jours à conserver les sauvegardes

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
echo "Création de la sauvegarde de la base de données..."
docker exec smartplanning-db mysqldump -u root -p"root_password" smartplanningai > "$BACKUP_DIR/smartplanning_backup_$TIMESTAMP.sql"

# Compresser la sauvegarde
echo "Compression de la sauvegarde..."
gzip "$BACKUP_DIR/smartplanning_backup_$TIMESTAMP.sql"

# Nettoyer les anciennes sauvegardes (plus vieilles que RETENTION_DAYS)
echo "Nettoyage des anciennes sauvegardes..."
find $BACKUP_DIR -name "smartplanning_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Sauvegarde terminée : $BACKUP_DIR/smartplanning_backup_$TIMESTAMP.sql.gz"
echo "Les sauvegardes de plus de $RETENTION_DAYS jours ont été supprimées." 