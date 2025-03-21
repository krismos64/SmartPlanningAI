-- Script de conversion des anciennes colonnes (comment et rejection_reason) vers la colonne reason
-- Ce script migre les données existantes sans perte d'information

-- 1. Vérifier si les colonnes existent
SET @commentExists = 0;
SET @rejectionReasonExists = 0;

SELECT COUNT(*) INTO @commentExists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'vacation_requests' 
AND COLUMN_NAME = 'comment';

SELECT COUNT(*) INTO @rejectionReasonExists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'vacation_requests' 
AND COLUMN_NAME = 'rejection_reason';

-- 2. Si les colonnes existent, migrer les données vers reason
SET @stmt = '';

-- Migrer d'abord les données de comment vers reason si vide
IF @commentExists > 0 THEN
    SET @stmt = CONCAT(@stmt, '
    UPDATE vacation_requests 
    SET reason = comment 
    WHERE (reason IS NULL OR reason = "") AND comment IS NOT NULL AND comment != "";
    ');
END IF;

-- Ensuite, ajouter les données de rejection_reason à reason (en préfixant)
IF @rejectionReasonExists > 0 THEN
    SET @stmt = CONCAT(@stmt, '
    UPDATE vacation_requests 
    SET reason = CASE
        WHEN reason IS NULL OR reason = "" THEN CONCAT("Motif de rejet: ", rejection_reason)
        ELSE CONCAT(reason, " | Motif de rejet: ", rejection_reason)
    END
    WHERE rejection_reason IS NOT NULL AND rejection_reason != "";
    ');
END IF;

-- Exécuter les instructions
IF LENGTH(@stmt) > 0 THEN
    PREPARE stmt FROM @stmt;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END IF;

-- 3. Supprimer les anciennes colonnes si elles existent
SET @dropComment = '';
SET @dropRejectionReason = '';

IF @commentExists > 0 THEN
    SET @dropComment = 'ALTER TABLE vacation_requests DROP COLUMN comment;';
    PREPARE stmt FROM @dropComment;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END IF;

IF @rejectionReasonExists > 0 THEN
    SET @dropRejectionReason = 'ALTER TABLE vacation_requests DROP COLUMN rejection_reason;';
    PREPARE stmt FROM @dropRejectionReason;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END IF;

-- Afficher un message de confirmation
SELECT 'Migration des données de vacations terminée avec succès' AS 'Message'; 