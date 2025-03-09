-- Migration pour ajouter les champs city et zip_code à la table employees
-- Date: 2025-03-09

-- 1. Ajouter la colonne city après address
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL AFTER address;

-- 2. Ajouter la colonne zip_code après city
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20) NULL AFTER city;

-- 3. Ajouter un message de confirmation
SELECT 'Migration pour ajouter city et zip_code à la table employees terminée avec succès' AS message; 