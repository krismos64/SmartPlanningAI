-- Désactiver temporairement les vérifications de clé étrangère
SET FOREIGN_KEY_CHECKS=0;

USE SmartPlanningAI;

-- Renommer les colonnes dans la table employees
ALTER TABLE employees
  CHANGE COLUMN birthdate birthdate DATE,
  CHANGE COLUMN hire_date hire_date DATE,
  CHANGE COLUMN contractHours contractHours DECIMAL(5,2) DEFAULT 35.0,
  CHANGE COLUMN hourlyRate hourlyRate DECIMAL(10,2);

-- Réactiver les vérifications de clé étrangère
SET FOREIGN_KEY_CHECKS=1; 