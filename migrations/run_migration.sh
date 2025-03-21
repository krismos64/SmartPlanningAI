#!/bin/bash

# Variables de configuration
DB_USER="root"
DB_PASS=""
DB_NAME="smartplanning" # Remplace par le nom de ta base de données

# Chemin vers le script SQL de migration
SQL_SCRIPT="convert_vacation_fields.sql"

# Message de début
echo "=== Début de la migration des données de vacations ==="
echo "Base de données: $DB_NAME"
echo "Script SQL: $SQL_SCRIPT"

# Exécution du script SQL
if [ -f "$SQL_SCRIPT" ]; then
    echo "Exécution du script SQL..."
    mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_SCRIPT"
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration terminée avec succès !"
    else
        echo "❌ Erreur lors de la migration. Vérifie les logs MySQL."
    fi
else
    echo "❌ Erreur: Le fichier $SQL_SCRIPT n'existe pas."
fi

echo "=== Fin de la migration ===" 