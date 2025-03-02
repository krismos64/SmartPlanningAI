-- Création de la base de données
CREATE DATABASE IF NOT EXISTS SmartPlanningAI;
USE SmartPlanningAI;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    department VARCHAR(50),
    position VARCHAR(100),
    startDate DATE,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    managerId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (managerId) REFERENCES employees(id) ON DELETE SET NULL
);

-- Table des plannings
CREATE TABLE IF NOT EXISTS plannings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    startDate DATE,
    endDate DATE,
    createdBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des événements de planning
CREATE TABLE IF NOT EXISTS planning_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    planningId INT NOT NULL,
    employeeId INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    startDateTime DATETIME NOT NULL,
    endDateTime DATETIME NOT NULL,
    type ENUM('shift', 'meeting', 'training', 'other') DEFAULT 'shift',
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (planningId) REFERENCES plannings(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Table des demandes de congés
CREATE TABLE IF NOT EXISTS vacation_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employeeId INT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    type ENUM('paid', 'unpaid', 'sick', 'other') DEFAULT 'paid',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reason TEXT,
    approvedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (username, email, password, firstName, lastName, role)
VALUES (
    'admin',
    'admin@smartplanning.ai',
    '$2b$10$1234567890123456789012', -- À remplacer par un vrai hash de mot de passe
    'Admin',
    'System',
    'admin'
) ON DUPLICATE KEY UPDATE id=id; 