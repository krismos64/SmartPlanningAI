# Gestion des Relations Utilisateur-Employé

Ce document explique comment les relations entre utilisateurs (users) et employés (employees) ont été restructurées dans l'application.

## Structure des Données

### Table 'users'

- Chaque entrée représente un utilisateur (administrateur) de l'application
- Possède ses propres employés

### Table 'employees'

- Chaque entrée représente un employé
- Chaque employé appartient à un utilisateur spécifique via le champ `user_id`
- Le champ `manager_id` identifie qui gère cet employé (généralement le même que `user_id`)

### Table 'vacation_requests'

- Chaque entrée représente une demande de congé
- `employee_id` identifie l'employé concerné par la demande
- `creator_id` identifie l'utilisateur qui a créé la demande de congé

## Changements Effectués

1. Le champ `user_id` dans la table 'employees' est désormais utilisé pour indiquer quel utilisateur a créé l'employé
2. Toutes les vérifications d'autorisation utilisent maintenant `user_id` au lieu de `manager_id`
3. Les routes API ont été modifiées pour n'afficher que les employés créés par l'utilisateur connecté
4. Une migration SQL a été créée pour mettre à jour les relations existantes

## Impacts

- Chaque utilisateur ne peut voir et gérer que ses propres employés
- Les demandes de congés restent associées au créateur original via `creator_id`
- Pour les demandes de congés, le champ `creator_id` reste utile pour identifier qui a créé la demande

## Comment Tester

Pour vérifier que la séparation des données fonctionne correctement :

1. Connectez-vous avec différents comptes utilisateur
2. Vérifiez que chaque utilisateur ne voit que ses propres employés
3. Vérifiez que les demandes de congés ne sont visibles que par les utilisateurs concernés
4. Essayez d'accéder à un employé d'un autre utilisateur (devrait être refusé)

## Migration des Données

Pour migrer les données existantes, exécutez le script SQL dans `backend/migrations/update_employee_user_relationships.sql`

Ce script :

- Met à jour les employés sans `user_id` pour utiliser leur `manager_id` comme valeur pour `user_id`
- Met à jour les demandes de congés sans `creator_id` pour utiliser le `user_id` de l'employé associé
