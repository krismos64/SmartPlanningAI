-- Script pour corriger les problèmes de structure de la base de données
USE SmartPlanningAI;

-- 1. Standardiser les noms de colonnes dans la table users (passer de camelCase à snake_case)
ALTER TABLE users 
CHANGE COLUMN firstName first_name VARCHAR(255),
CHANGE COLUMN lastName last_name VARCHAR(255),
CHANGE COLUMN profileImage profile_image LONGBLOB,
CHANGE COLUMN jobTitle job_title VARCHAR(100);

-- 2. Ajouter un champ user_id à la table employees pour lier les employés aux utilisateurs
ALTER TABLE employees
ADD COLUMN user_id INT NULL AFTER id,
ADD CONSTRAINT fk_employees_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Ajouter un champ hourly_rate à la table employees
ALTER TABLE employees
ADD COLUMN hourly_rate DECIMAL(10,2) NULL AFTER contract_hours;

-- 4. Ajouter les champs manquants à la table vacation_requests
ALTER TABLE vacation_requests
ADD COLUMN rejection_reason TEXT NULL AFTER rejected_at,
ADD COLUMN attachment VARCHAR(255) NULL AFTER rejection_reason,
ADD COLUMN quota_exceeded TINYINT(1) NOT NULL DEFAULT 0 AFTER attachment;

-- 5. Standardiser les noms de colonnes dans la table vacations (passer de camelCase à snake_case)
ALTER TABLE vacations 
CHANGE COLUMN employeeId employee_id INT(11) NOT NULL,
CHANGE COLUMN startDate start_date DATE NOT NULL,
CHANGE COLUMN endDate end_date DATE NOT NULL,
CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 6. Standardiser les noms de colonnes dans la table shifts (passer de camelCase à snake_case)
ALTER TABLE shifts 
CHANGE COLUMN employeeId employee_id INT(11) NOT NULL,
CHANGE COLUMN startTime start_time DATETIME NOT NULL,
CHANGE COLUMN endTime end_time DATETIME NOT NULL,
CHANGE COLUMN createdBy created_by INT(11) NOT NULL,
CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 7. Créer une vue pour faciliter la transition entre les deux tables de congés
CREATE OR REPLACE VIEW vacation_view AS
SELECT 
    vr.id,
    vr.employee_id,
    vr.type,
    vr.start_date,
    vr.end_date,
    vr.status,
    vr.reason AS notes,
    vr.created_at
FROM vacation_requests vr
UNION ALL
SELECT 
    v.id,
    v.employee_id,
    CASE 
        WHEN v.type = 'annual' THEN 'paid'
        WHEN v.type = 'sick' THEN 'sick'
        ELSE 'other'
    END AS type,
    v.start_date,
    v.end_date,
    v.status,
    v.notes,
    v.created_at
FROM vacations v;

-- 8. Ajouter des index pour améliorer les performances
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_vacation_requests_dates ON vacation_requests(start_date, end_date);
CREATE INDEX idx_weekly_schedules_dates ON weekly_schedules(week_start, week_end);

-- 9. Mettre à jour les contraintes de clé étrangère pour les tables shifts et statistics
ALTER TABLE shifts
ADD CONSTRAINT fk_shifts_employees FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_shifts_users FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE statistics
ADD CONSTRAINT fk_statistics_employees FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- Note: La migration des données de la table vacations vers vacation_requests n'est pas incluse ici
-- car elle nécessite une analyse plus approfondie des données existantes.
-- Il est recommandé de faire cette migration manuellement après avoir vérifié les données. 