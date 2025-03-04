-- Table pour stocker les plannings hebdomadaires des employés
CREATE TABLE IF NOT EXISTS `weekly_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `week_start` DATE NOT NULL COMMENT 'Date de début de la semaine (lundi)',
  `week_end` DATE NOT NULL COMMENT 'Date de fin de la semaine (dimanche)',
  `schedule_data` JSON NOT NULL COMMENT 'Données du planning au format JSON',
  `total_hours` DECIMAL(5,2) DEFAULT 0 COMMENT 'Total des heures planifiées',
  `status` VARCHAR(20) DEFAULT 'draft' COMMENT 'État du planning (draft, published, completed)',
  `created_by` INT NOT NULL COMMENT 'ID de l\'utilisateur qui a créé le planning',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `employee_week` (`employee_id`, `week_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour accélérer les recherches par semaine
CREATE INDEX IF NOT EXISTS `idx_weekly_schedules_week_start` ON `weekly_schedules` (`week_start`);

-- Index pour accélérer les recherches par employé
CREATE INDEX IF NOT EXISTS `idx_weekly_schedules_employee_id` ON `weekly_schedules` (`employee_id`);

-- Exemple de données pour le planning hebdomadaire
-- INSERT INTO `weekly_schedules` (`employee_id`, `week_start`, `week_end`, `schedule_data`, `total_hours`, `status`, `created_by`) VALUES
-- (1, '2023-11-06', '2023-11-12', '{
--   "2023-11-06": {"start_time": "09:00", "end_time": "17:00", "hours": 8},
--   "2023-11-07": {"start_time": "09:00", "end_time": "17:00", "hours": 8},
--   "2023-11-08": {"start_time": "09:00", "end_time": "17:00", "hours": 8},
--   "2023-11-09": {"start_time": "09:00", "end_time": "17:00", "hours": 8},
--   "2023-11-10": {"start_time": "09:00", "end_time": "17:00", "hours": 8},
--   "2023-11-11": {"start_time": null, "end_time": null, "hours": 0},
--   "2023-11-12": {"start_time": null, "end_time": null, "hours": 0}
-- }', 40.00, 'published', 1); 