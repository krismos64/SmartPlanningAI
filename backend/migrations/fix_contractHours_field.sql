-- Migration pour corriger le champ contractHours dans la table employees
-- Date: 2025-03-27

-- Vérifier si la colonne contractHours existe avec le bon format
SET @contractHoursExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'contractHours'
);

-- Si la colonne n'existe pas, la créer
SET @createContractHoursSQL = IF(@contractHoursExists = 0,
    'ALTER TABLE employees ADD COLUMN contractHours DECIMAL(5,2) DEFAULT 35.0 AFTER role',
    'SELECT "La colonne contractHours existe déjà" AS message'
);

PREPARE stmt FROM @createContractHoursSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si la colonne existe mais avec un nom différent (contract_hours), la renommer
SET @contractHoursSnakeCaseExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'contract_hours'
);

SET @renameContractHoursSQL = IF(@contractHoursSnakeCaseExists > 0,
    'ALTER TABLE employees CHANGE COLUMN contract_hours contractHours DECIMAL(5,2) DEFAULT 35.0',
    'SELECT "La colonne contract_hours n\'existe pas" AS message'
);

PREPARE stmt FROM @renameContractHoursSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Afficher un message de confirmation
SELECT 'Migration pour corriger le champ contractHours terminée avec succès' AS message; 