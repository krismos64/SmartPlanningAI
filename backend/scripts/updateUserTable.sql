-- Utiliser la base de données
USE SmartPlanningAI;

-- Vérifier si les colonnes existent déjà avant de les ajouter
SET @dbname = 'SmartPlanningAI';

-- Ajouter la colonne profileImage si elle n'existe pas
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profileImage';

SET @sqlStatement = IF(@columnExists > 0, 
    'SELECT "La colonne profileImage existe déjà."', 
    'ALTER TABLE users ADD COLUMN profileImage LONGBLOB');
PREPARE stmt FROM @sqlStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne company si elle n'existe pas
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'company';

SET @sqlStatement = IF(@columnExists > 0, 
    'SELECT "La colonne company existe déjà."', 
    'ALTER TABLE users ADD COLUMN company VARCHAR(100)');
PREPARE stmt FROM @sqlStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne phone si elle n'existe pas
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone';

SET @sqlStatement = IF(@columnExists > 0, 
    'SELECT "La colonne phone existe déjà."', 
    'ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
PREPARE stmt FROM @sqlStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne jobTitle si elle n'existe pas
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'jobTitle';

SET @sqlStatement = IF(@columnExists > 0, 
    'SELECT "La colonne jobTitle existe déjà."', 
    'ALTER TABLE users ADD COLUMN jobTitle VARCHAR(100)');
PREPARE stmt FROM @sqlStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Afficher un message de confirmation
SELECT 'Mise à jour de la table users terminée avec succès.' AS Message; 