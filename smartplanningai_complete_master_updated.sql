-- Script SQL complet pour la base de données SmartPlanningAI
-- Généré le: 26 Mars 2025
-- Version: 1.1

-- Supprimer la base de données si elle existe
DROP DATABASE IF EXISTS `smartplanningai`;

-- Créer la base de données
CREATE DATABASE `smartplanningai` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE `smartplanningai`;

-- Désactiver les contraintes de clés étrangères pour la restauration
SET FOREIGN_KEY_CHECKS=0;

-- --------------------------------------------------------
-- Table structure: users
-- Description: Stocke les informations des utilisateurs de l'application
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin') NOT NULL DEFAULT 'admin',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profileImage` longtext DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `jobTitle` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: user_settings
-- Description: Stocke les préférences des utilisateurs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `theme_mode` enum('light','dark') DEFAULT 'light',
  `language` varchar(10) DEFAULT 'fr',
  `notifications_enabled` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: departments
-- Description: Gère les départements de l'entreprise
-- --------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_departments_user_id` (`user_id`),
  CONSTRAINT `fk_departments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: employees
-- Description: Stocke les informations des employés
-- --------------------------------------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Conservé pour compatibilité avec le système d''activités',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `contractHours` decimal(5,2) DEFAULT 35.00,
  `status` enum('active','inactive','vacation','sick') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hour_balance` decimal(5,2) DEFAULT 0.00,
  `department_id` int(11) DEFAULT NULL,
  `manager_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_employees_user_id` (`user_id`),
  KEY `fk_employees_department` (`department_id`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_employees_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_employees_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: activities
-- Description: Journalisation des activités des utilisateurs et des événements du système
-- --------------------------------------------------------
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL COMMENT 'Type d''action: create, update, delete, login, logout, approve, reject, etc.',
  `entity_type` varchar(50) NOT NULL COMMENT 'Type d''entité concernée: employee, schedule, vacation, user, etc.',
  `entity_id` varchar(50) DEFAULT NULL COMMENT 'ID de l''entité concernée',
  `description` varchar(255) NOT NULL COMMENT 'Description de l''action effectuée',
  `user_id` int(11) DEFAULT NULL COMMENT 'ID de l''utilisateur qui a effectué l''action',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Adresse IP de l''utilisateur',
  `user_agent` text DEFAULT NULL COMMENT 'User-Agent du navigateur',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Détails supplémentaires au format JSON' CHECK (json_valid(`details`)),
  `timestamp` datetime DEFAULT current_timestamp() COMMENT 'Date et heure de l''action',
  PRIMARY KEY (`id`),
  KEY `idx_activities_type` (`type`),
  KEY `idx_activities_entity_type` (`entity_type`),
  KEY `idx_activities_entity_id` (`entity_id`),
  KEY `idx_activities_user_id` (`user_id`),
  KEY `idx_activities_timestamp` (`timestamp`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: notifications
-- Description: Gère les notifications envoyées aux utilisateurs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `link` varchar(255) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_read` (`read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: shifts
-- Description: Gère les horaires de travail des employés (shifts individuels)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_shifts_employee_id` (`employee_id`),
  KEY `idx_shifts_start_time` (`start_time`),
  KEY `idx_shifts_end_time` (`end_time`),
  KEY `idx_shifts_status` (`status`),
  CONSTRAINT `fk_shifts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_shifts_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: vacation_requests
-- Description: Gère les demandes de congés des employés
-- --------------------------------------------------------
DROP TABLE IF EXISTS `vacation_requests`;
CREATE TABLE `vacation_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `creator_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `type` enum('paid','unpaid','sick','other') NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_by` int(11) DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vacation_requests_employee` (`employee_id`),
  KEY `fk_vacation_requests_approved_by` (`approved_by`),
  KEY `fk_vacation_requests_rejected_by` (`rejected_by`),
  KEY `idx_vacation_creator_id` (`creator_id`),
  CONSTRAINT `fk_vacation_requests_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vacation_requests_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vacation_requests_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vacation_requests_rejected_by` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vacation_requests_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: weekly_schedules
-- Description: Gère les plannings hebdomadaires des employés
-- --------------------------------------------------------
DROP TABLE IF EXISTS `weekly_schedules`;
CREATE TABLE `weekly_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `week_start` date NOT NULL,
  `week_end` date DEFAULT NULL,
  `schedule_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`schedule_data`)),
  `total_hours` decimal(5,2) DEFAULT 0.00,
  `status` enum('draft','published','approved') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_week` (`employee_id`,`week_start`),
  KEY `fk_weekly_creator` (`created_by`),
  KEY `fk_updated_by` (`updated_by`),
  CONSTRAINT `fk_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_weekly_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_weekly_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure: work_hours
-- Description: Enregistre les heures de travail réelles des employés
-- --------------------------------------------------------
DROP TABLE IF EXISTS `work_hours`;
CREATE TABLE `work_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `expected_hours` decimal(5,2) NOT NULL DEFAULT 7.00,
  `actual_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `balance` decimal(5,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `idx_work_hours_user_id` (`user_id`),
  CONSTRAINT `fk_work_hours_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `work_hours_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Déclencheurs (Triggers)
-- --------------------------------------------------------

/* Les triggers suivants ne sont pas actuellement présents dans la base de données
-- Trigger pour mettre à jour le solde des heures de travail lors de l'insertion
DELIMITER //
CREATE TRIGGER `work_hours_after_insert` AFTER INSERT ON `work_hours`
FOR EACH ROW
BEGIN
  DECLARE emp_balance DECIMAL(5,2);
  
  -- Calculer le nouveau solde (différence entre heures réelles et prévues)
  SET emp_balance = NEW.actual_hours - NEW.expected_hours;
  
  -- Mettre à jour la table work_hours avec le solde calculé
  UPDATE work_hours 
  SET balance = emp_balance
  WHERE id = NEW.id;
  
  -- Mettre à jour le solde des heures dans la table employees
  UPDATE employees 
  SET hour_balance = hour_balance + emp_balance
  WHERE id = NEW.employee_id;
END //
DELIMITER ;

-- Trigger pour mettre à jour le solde des heures de travail lors de la mise à jour
DELIMITER //
CREATE TRIGGER `work_hours_after_update` AFTER UPDATE ON `work_hours`
FOR EACH ROW
BEGIN
  DECLARE emp_balance DECIMAL(5,2);
  DECLARE old_balance DECIMAL(5,2);
  
  -- Calculer les soldes
  SET old_balance = OLD.actual_hours - OLD.expected_hours;
  SET emp_balance = NEW.actual_hours - NEW.expected_hours;
  
  -- Mettre à jour la table work_hours avec le nouveau solde
  UPDATE work_hours 
  SET balance = emp_balance
  WHERE id = NEW.id;
  
  -- Mettre à jour le solde des heures dans la table employees
  UPDATE employees 
  SET hour_balance = hour_balance - old_balance + emp_balance
  WHERE id = NEW.employee_id;
END //
DELIMITER ;

-- Trigger pour mettre à jour le solde des heures de travail lors de la suppression
DELIMITER //
CREATE TRIGGER `work_hours_after_delete` AFTER DELETE ON `work_hours`
FOR EACH ROW
BEGIN
  DECLARE old_balance DECIMAL(5,2);
  
  -- Calculer le solde à supprimer
  SET old_balance = OLD.actual_hours - OLD.expected_hours;
  
  -- Mettre à jour le solde des heures dans la table employees
  UPDATE employees 
  SET hour_balance = hour_balance - old_balance
  WHERE id = OLD.employee_id;
END //
DELIMITER ;
*/

-- --------------------------------------------------------
-- Procédures stockées
-- --------------------------------------------------------

-- Procédure stockée pour calculer le total des heures d'un planning hebdomadaire
DELIMITER //
CREATE PROCEDURE `calculate_weekly_schedule_hours`(IN schedule_id INT)
BEGIN
  DECLARE total DECIMAL(5,2) DEFAULT 0;
  DECLARE schedule_data JSON;
  DECLARE i INT DEFAULT 0;
  DECLARE array_length INT;
  DECLARE current_hours DECIMAL(5,2);
  
  -- Récupérer les données du planning
  SELECT ws.schedule_data INTO schedule_data 
  FROM weekly_schedules ws 
  WHERE ws.id = schedule_id;
  
  -- Obtenir la longueur du tableau JSON
  SET array_length = JSON_LENGTH(schedule_data);
  
  -- Parcourir chaque élément du tableau et additionner les heures
  WHILE i < array_length DO
    -- Extraire les heures pour la journée courante
    SET current_hours = CAST(JSON_UNQUOTE(JSON_EXTRACT(schedule_data, CONCAT('$[', i, '].hours'))) AS DECIMAL(5,2));
    SET total = total + current_hours;
    SET i = i + 1;
  END WHILE;
  
  -- Mettre à jour le total des heures dans le planning
  UPDATE weekly_schedules 
  SET total_hours = total
  WHERE id = schedule_id;
  
END //
DELIMITER ;

-- Activer les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS=1;

-- Fin du script 