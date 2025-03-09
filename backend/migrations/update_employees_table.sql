-- Migration pour mettre à jour la structure de la table employees
-- Date: 2025-03-09

-- 1. Vérifier si la colonne phone existe, sinon l'ajouter
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER email;

-- 2. Vérifier si la colonne address existe, sinon l'ajouter
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER phone;

-- 3. Supprimer la colonne hourlyRate car elle est inutile
-- Vérifier d'abord si la colonne existe
SET @hourlyRateExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'hourlyRate'
);

SET @dropHourlyRateSQL = IF(@hourlyRateExists > 0,
    'ALTER TABLE employees DROP COLUMN hourlyRate',
    'SELECT "La colonne hourlyRate n\'existe pas" AS message'
);

PREPARE stmt FROM @dropHourlyRateSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Conserver user_id mais le rendre explicitement NULL par défaut
-- car il est utilisé dans certaines parties du code pour les activités
ALTER TABLE employees
MODIFY COLUMN user_id INT NULL DEFAULT NULL;

-- 5. Ajouter un commentaire pour indiquer que user_id est conservé uniquement pour la compatibilité
ALTER TABLE employees
MODIFY COLUMN user_id INT NULL DEFAULT NULL COMMENT 'Conservé pour compatibilité avec le système d\'activités';

-- 6. Mettre à jour les index si nécessaire
-- S'assurer que l'index sur user_id existe
SET @userIdIndexExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND INDEX_NAME = 'idx_employees_user_id'
);

SET @createUserIdIndexSQL = IF(@userIdIndexExists = 0,
    'CREATE INDEX idx_employees_user_id ON employees(user_id)',
    'SELECT "L\'index idx_employees_user_id existe déjà" AS message'
);

PREPARE stmt FROM @createUserIdIndexSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Ajouter un message de confirmation
SELECT 'Migration de la table employees terminée avec succès' AS message; 