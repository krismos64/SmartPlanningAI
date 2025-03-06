-- Désactiver temporairement les vérifications de clé étrangère
SET FOREIGN_KEY_CHECKS=0;

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS SmartPlanningAI;
USE SmartPlanningAI;

-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS weekly_schedules;
DROP TABLE IF EXISTS vacation_requests;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  birthdate DATE,
  hire_date DATE,
  department VARCHAR(100),
  role VARCHAR(100),
  contractHours DECIMAL(5,2) DEFAULT 35.0,
  hourlyRate DECIMAL(10,2),
  status ENUM('active', 'inactive', 'vacation', 'sick') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des demandes de congés
CREATE TABLE IF NOT EXISTS vacation_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type ENUM('paid', 'unpaid', 'sick', 'other') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reason TEXT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Table des plannings hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  week_start DATE NOT NULL,
  days JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY employee_week (employee_id, week_start)
);

-- Insertion de données de test
INSERT INTO users (email, password, role) VALUES
('admin@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQXFJdjsWUCTwHzk5JMfqDdW2PzZmO', 'admin'),
('manager@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQXFJdjsWUCTwHzk5JMfqDdW2PzZmO', 'manager'),
('employee@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQXFJdjsWUCTwHzk5JMfqDdW2PzZmO', 'employee');

-- Insertion d'employés de test
INSERT INTO employees (user_id, first_name, last_name, email, phone, department, role, contractHours, hourlyRate, status) VALUES
(1, 'Admin', 'User', 'admin@example.com', '123-456-7890', 'Administration', 'Administrateur', 35.0, 25.0, 'active'),
(2, 'Manager', 'User', 'manager@example.com', '123-456-7891', 'Ventes', 'Manager', 35.0, 22.0, 'active'),
(3, 'Employee', 'User', 'employee@example.com', '123-456-7892', 'Support', 'Agent', 35.0, 18.0, 'active');

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (email, password, first_name, last_name, role)
VALUES (
    'admin@smartplanning.ai',
    '$2b$10$1234567890123456789012', -- À remplacer par un vrai hash de mot de passe
    'Admin',
    'System',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;

-- Réactiver les vérifications de clé étrangère
SET FOREIGN_KEY_CHECKS=1; 