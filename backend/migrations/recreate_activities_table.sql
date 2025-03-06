-- Script pour recréer la table activities avec des attributs améliorés
USE SmartPlanningAI;

-- Supprimer la table activities si elle existe
DROP TABLE IF EXISTS activities;

-- Créer la nouvelle table activities avec des attributs améliorés
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL COMMENT 'Type d''action: create, update, delete, login, logout, approve, reject, etc.',
  entity_type VARCHAR(50) NOT NULL COMMENT 'Type d''entité concernée: employee, schedule, vacation, user, etc.',
  entity_id VARCHAR(50) DEFAULT NULL COMMENT 'ID de l''entité concernée',
  description VARCHAR(255) NOT NULL COMMENT 'Description de l''action effectuée',
  user_id INT DEFAULT NULL COMMENT 'ID de l''utilisateur qui a effectué l''action',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Adresse IP de l''utilisateur',
  user_agent TEXT DEFAULT NULL COMMENT 'User-Agent du navigateur',
  details JSON DEFAULT NULL COMMENT 'Détails supplémentaires au format JSON',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure de l''action',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_entity_type ON activities(entity_type);
CREATE INDEX idx_activities_entity_id ON activities(entity_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);

-- Ajouter quelques activités de test
INSERT INTO activities (type, entity_type, entity_id, description, user_id, timestamp)
VALUES 
('login', 'user', '9', 'Connexion au système', 9, NOW() - INTERVAL 1 HOUR),
('create', 'employee', '3', 'Création d''un nouvel employé', 9, NOW() - INTERVAL 45 MINUTE),
('update', 'schedule', '2', 'Mise à jour du planning', 11, NOW() - INTERVAL 30 MINUTE),
('approve', 'vacation', '1', 'Approbation d''une demande de congé', 11, NOW() - INTERVAL 15 MINUTE);

-- Afficher la structure de la table
DESCRIBE activities;

-- Afficher les données de test
SELECT * FROM activities; 