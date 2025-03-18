-- Script pour ajouter la colonne 'duration' à la table vacation_requests
USE SmartPlanningAI;

-- Vérifier si la colonne existe déjà
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'SmartPlanningAI' AND TABLE_NAME = 'vacation_requests' AND COLUMN_NAME = 'duration';

-- Ajouter la colonne si elle n'existe pas
SET @query = IF(@exists = 0, 
    'ALTER TABLE vacation_requests ADD COLUMN duration INT DEFAULT NULL AFTER end_date',
    'SELECT "La colonne duration existe déjà dans la table vacation_requests" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mettre à jour les durées existantes (en jours calendaires pour simplifier)
UPDATE vacation_requests 
SET duration = DATEDIFF(end_date, start_date) + 1
WHERE duration IS NULL AND start_date IS NOT NULL AND end_date IS NOT NULL;

-- Afficher la structure mise à jour
DESCRIBE vacation_requests;
