-- Migration pour ajouter la colonne updated_by à la table weekly_schedules
-- Date: 24/03/2024

-- Ajout de la colonne updated_by (nullable) et de la contrainte de clé étrangère
ALTER TABLE weekly_schedules
ADD COLUMN updated_by INT NULL,
ADD CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- Log pour confirmer la migration
SELECT 'Migration completed: Added updated_by column to weekly_schedules table' as 'Migration Info'; 