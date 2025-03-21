-- Optimisation de la table vacation_requests

-- 1. S'assurer que les contraintes de clé étrangère sont correctement définies
-- Vérifier si les contraintes existent déjà
SET @constraint_exists = (SELECT COUNT(*) 
  FROM information_schema.REFERENTIAL_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = 'SmartPlanningAI' 
  AND CONSTRAINT_NAME = 'fk_vacation_requests_creator');

-- Si la contrainte n'existe pas, l'ajouter
SET @sql = IF(@constraint_exists = 0, 
  'ALTER TABLE vacation_requests ADD CONSTRAINT fk_vacation_requests_creator 
   FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "La contrainte creator_id existe déjà" AS message');
  
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Vérifier si les champs creator_id, approved_by et rejected_by sont correctement définis
-- Mise à jour des approved_by et rejected_by NULL qui devraient référencer les utilisateurs
UPDATE vacation_requests 
SET creator_id = (
    SELECT user_id 
    FROM employees 
    WHERE id = employee_id
)
WHERE creator_id IS NULL;

-- 3. Consolider les champs comment et reason
-- Pour éviter de perdre des données, d'abord fusionner le contenu des deux champs
UPDATE vacation_requests
SET reason = CONCAT_WS(' | ', reason, comment)
WHERE comment IS NOT NULL AND comment != '';

-- 4. Consolider rejection_reason avec reason pour les demandes rejetées
UPDATE vacation_requests
SET reason = CONCAT_WS(' | Motif de rejet: ', reason, rejection_reason)
WHERE status = 'rejected' AND rejection_reason IS NOT NULL AND rejection_reason != '';

-- 5. Ajouter un index sur creator_id pour améliorer les performances
ALTER TABLE vacation_requests ADD INDEX idx_vacation_creator_id (creator_id);

-- 6. Nettoyer les colonnes redondantes si nécessaire
-- Note: Nous gardons ces colonnes pour l'instant pour éviter de casser l'application
-- ALTER TABLE vacation_requests DROP COLUMN comment;
-- ALTER TABLE vacation_requests DROP COLUMN rejection_reason;

-- 7. Afficher les résultats pour vérification
SELECT id, employee_id, creator_id, approved_by, rejected_by, status, reason
FROM vacation_requests
LIMIT 10; 