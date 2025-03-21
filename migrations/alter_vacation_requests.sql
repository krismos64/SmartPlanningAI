-- Script pour supprimer les colonnes redondantes de la table vacation_requests

-- 1. Vérifier que les données ont été fusionnées dans la colonne reason
SELECT id, reason, comment, rejection_reason 
FROM vacation_requests 
WHERE comment IS NOT NULL OR rejection_reason IS NOT NULL
LIMIT 10;

-- 2. Supprimer la colonne comment
ALTER TABLE vacation_requests DROP COLUMN comment;

-- 3. Supprimer la colonne rejection_reason
ALTER TABLE vacation_requests DROP COLUMN rejection_reason;

-- 4. Vérifier la structure finale
DESCRIBE vacation_requests;

-- 5. Ajouter un message de confirmation dans le log
SELECT 'Migration terminée avec succès : colonnes comment et rejection_reason supprimées' AS message; 