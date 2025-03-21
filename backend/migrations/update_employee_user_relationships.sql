-- Migration pour mettre à jour les relations entre employés et utilisateurs
-- Cette migration met à jour le champ user_id dans la table employees 
-- pour garantir que chaque employé est associé à l'utilisateur qui l'a créé

-- Identifier tous les employés sans user_id
SELECT id, first_name, last_name, manager_id FROM employees WHERE user_id IS NULL;

-- Mettre à jour les employés sans user_id pour utiliser leur manager_id comme user_id
-- Cela part du principe que le manager est également l'utilisateur qui a créé l'employé
UPDATE employees 
SET user_id = manager_id
WHERE user_id IS NULL;

-- Vérifier la mise à jour
SELECT id, first_name, last_name, user_id, manager_id FROM employees;

-- Afficher les employés par utilisateur
SELECT 
    u.id as user_id, 
    u.email, 
    u.first_name as user_first_name, 
    u.last_name as user_last_name,
    COUNT(e.id) as employee_count
FROM 
    users u
LEFT JOIN 
    employees e ON u.id = e.user_id
GROUP BY 
    u.id, u.email, u.first_name, u.last_name
ORDER BY 
    employee_count DESC;

-- Vérifier les demandes de congés pour s'assurer qu'elles ont un creator_id
SELECT id, employee_id, creator_id, status FROM vacation_requests WHERE creator_id IS NULL;

-- Mettre à jour les demandes de congés sans creator_id
-- pour utiliser le user_id de l'employé associé
UPDATE vacation_requests vr
SET creator_id = (
    SELECT user_id 
    FROM employees 
    WHERE id = vr.employee_id
)
WHERE creator_id IS NULL; 