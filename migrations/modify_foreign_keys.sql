-- Script pour modifier les contraintes de clé étrangère des tables activities et departments
-- afin qu'elles utilisent ON DELETE CASCADE au lieu de ON DELETE SET NULL

-- Suppression des contraintes de clé étrangère existantes
ALTER TABLE activities DROP FOREIGN KEY activities_ibfk_1;
ALTER TABLE departments DROP FOREIGN KEY fk_departments_user;

-- Recréation des contraintes avec ON DELETE CASCADE
ALTER TABLE activities
ADD CONSTRAINT activities_ibfk_1
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE departments
ADD CONSTRAINT fk_departments_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Nettoyer les entrées orphelines (dont le user_id est NULL)
DELETE FROM activities WHERE user_id IS NULL;
DELETE FROM departments WHERE user_id IS NULL;

-- Afficher un message de confirmation
SELECT 'Contraintes de clé étrangère modifiées avec succès' AS 'Message'; 