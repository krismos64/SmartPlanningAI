-- Script pour ajouter la colonne 'type' à la table vacation_requests
USE smartplanningai;

-- Vérifier si la colonne existe déjà
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'smartplanningai' AND TABLE_NAME = 'vacation_requests' AND COLUMN_NAME = 'type';

-- Ajouter la colonne si elle n'existe pas
SET @query = IF(@exists = 0, 
    'ALTER TABLE vacation_requests ADD COLUMN type ENUM("paid", "unpaid", "sick", "rtt", "exceptional", "recovery") NOT NULL DEFAULT "paid" AFTER employee_id',
    'SELECT "La colonne type existe déjà dans la table vacation_requests" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Afficher la structure mise à jour
DESCRIBE vacation_requests; 