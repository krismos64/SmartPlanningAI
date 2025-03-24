-- Script pour créer ou mettre à jour la table shifts
USE smartplanningai;

-- Créer la table shifts si elle n'existe pas
CREATE TABLE IF NOT EXISTS shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  created_by INT NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Ajouter des index pour améliorer les performances
-- Utiliser DROP INDEX IF EXISTS pour éviter les erreurs
DROP INDEX IF EXISTS idx_shifts_employee_id ON shifts;
CREATE INDEX idx_shifts_employee_id ON shifts(employee_id);

DROP INDEX IF EXISTS idx_shifts_start_time ON shifts;
CREATE INDEX idx_shifts_start_time ON shifts(start_time);

DROP INDEX IF EXISTS idx_shifts_end_time ON shifts;
CREATE INDEX idx_shifts_end_time ON shifts(end_time);

DROP INDEX IF EXISTS idx_shifts_status ON shifts;
CREATE INDEX idx_shifts_status ON shifts(status);

-- Mettre à jour la structure de la table si elle existe déjà
-- Vérifier si la colonne status a les bonnes valeurs enum
ALTER TABLE shifts MODIFY COLUMN status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled';

-- Convertir les anciennes valeurs de status si nécessaire
UPDATE shifts SET status = 'scheduled' WHERE status = 'manual';
UPDATE shifts SET status = 'completed' WHERE status = 'auto'; 