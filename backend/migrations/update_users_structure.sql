SET FOREIGN_KEY_CHECKS=0;

USE smartplanningai;

-- Supprimer la colonne username de la table users
ALTER TABLE users DROP COLUMN IF EXISTS username;

SET FOREIGN_KEY_CHECKS=1; 