# Modèle de Sécurité de SmartPlanningAI

Ce document décrit le modèle de sécurité et d'isolation des données mis en place dans l'application SmartPlanningAI.

## Principe Général

Chaque utilisateur ne peut voir et modifier que les données qu'il a lui-même créées. Cette isolation est appliquée à toutes les entités principales :

- Employés
- Départements
- Demandes de congés
- Plannings
- Heures de travail

## Structure des Relations

### 1. Table `users`

- Table centrale contenant tous les utilisateurs (administrateurs) du système
- `id` : Identifiant unique de l'utilisateur

### 2. Table `employees`

- Chaque employé est lié à l'utilisateur qui l'a créé via `user_id`
- Chaque employé est également géré par un utilisateur via `manager_id` (généralement identique à `user_id`)
- Relations :
  - `employees.user_id → users.id`
  - `employees.manager_id → users.id`

### 3. Table `departments`

- Chaque département est lié à l'utilisateur qui l'a créé via `user_id`
- Relations :
  - `departments.user_id → users.id`

### 4. Table `vacation_requests`

- Chaque demande de congé est liée à :
  - L'employé concerné via `employee_id`
  - L'utilisateur qui a créé la demande via `creator_id`
- Relations :
  - `vacation_requests.employee_id → employees.id`
  - `vacation_requests.creator_id → users.id`

### 5. Table `work_hours`

- Chaque enregistrement d'heures de travail est lié à :
  - L'employé concerné via `employee_id`
  - L'utilisateur qui a créé l'enregistrement via `user_id`
- Relations :
  - `work_hours.employee_id → employees.id`
  - `work_hours.user_id → users.id`

## Mise en œuvre dans le Code

### 1. Dans les contrôleurs et routes API

Toutes les routes protégées (via middleware `auth`) vérifient que :

1. L'utilisateur est authentifié (token JWT valide)
2. Les données demandées appartiennent bien à cet utilisateur (via la vérification du `user_id` associé)

Exemple pour la route GET d'un employé :

```javascript
// Vérifier que l'employé appartient à l'utilisateur connecté
if (employee.user_id !== userId) {
  return res.status(403).json({
    message: "Vous n'êtes pas autorisé à accéder à cet employé",
  });
}
```

### 2. Dans les modèles

Chaque modèle dispose désormais d'une méthode `findByUserId` qui permet de récupérer les données appartenant à un utilisateur spécifique :

```javascript
static async findByUserId(userId) {
  try {
    const [rows] = await connectDB.query(
      "SELECT * FROM table WHERE user_id = ?",
      [userId]
    );
    return rows.map((row) => new Model(row));
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}
```

## Vérification de l'Accès

Pour garantir l'isolation des données, les vérifications suivantes sont effectuées :

1. **Lecture de données** : Filtrage par `user_id` pour ne récupérer que les données de l'utilisateur
2. **Modification de données** : Vérification que la donnée appartient à l'utilisateur avant modification
3. **Suppression de données** : Vérification que la donnée appartient à l'utilisateur avant suppression
4. **Création de données** : Ajout automatique du `user_id` de l'utilisateur connecté

## Scripts de Migration

Des scripts SQL ont été créés pour mettre à jour la structure existante et garantir l'intégrité des données :

1. `update_employee_user_relationships.sql` : Association des employés à leurs utilisateurs
2. `alter_departments.sql` : Ajout du champ `user_id` à la table des départements
3. `alter_work_hours.sql` : Ajout du champ `user_id` à la table des heures de travail
