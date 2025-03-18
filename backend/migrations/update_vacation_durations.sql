-- Script pour mettre à jour les durées des demandes de congés en jours ouvrés
USE SmartPlanningAI;

-- Mettre à jour directement les durées avec une méthode simple pour chaque demande de congé
UPDATE vacation_requests SET duration = (
    -- Calculer le nombre de jours ouvrés (lundi à vendredi)
    CASE
        -- Si les deux dates sont identiques, vérifier si c'est un jour ouvré
        WHEN start_date = end_date THEN
            CASE
                WHEN DAYOFWEEK(start_date) IN (1, 7) THEN 0 -- Weekend (Dimanche=1, Samedi=7)
                ELSE 1
            END
            
        -- Sinon calculer la différence en jours puis soustraire les weekends
        ELSE
            DATEDIFF(end_date, start_date) + 1 -- Total de jours
            - FLOOR((DATEDIFF(end_date, start_date) + DAYOFWEEK(start_date) - 1) / 7) * 2 -- Soustraire tous les weekends complets
            - CASE 
                -- Ajuster pour les weekends partiels au début ou à la fin
                WHEN DAYOFWEEK(start_date) = 1 THEN 1 -- Dimanche au début
                ELSE 0
              END
            - CASE 
                WHEN DAYOFWEEK(end_date) = 7 THEN 1 -- Samedi à la fin
                ELSE 0
              END
    END
);

-- Vérifier que les durées ont été correctement mises à jour
SELECT 
    id, 
    employee_id, 
    start_date, 
    end_date, 
    duration, 
    DATEDIFF(end_date, start_date) + 1 AS calendar_days,
    type, 
    status 
FROM 
    vacation_requests 
ORDER BY 
    id;
