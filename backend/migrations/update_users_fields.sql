SET FOREIGN_KEY_CHECKS=0;

USE SmartPlanningAI;

-- Ajouter les champs manquants à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profileImage LONGTEXT NULL,
ADD COLUMN IF NOT EXISTS company VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS jobTitle VARCHAR(100) NULL;

SET FOREIGN_KEY_CHECKS=1; 