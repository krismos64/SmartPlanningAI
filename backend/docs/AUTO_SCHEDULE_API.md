# Documentation de l'API de Génération Automatique de Planning

## Introduction

L'API de génération automatique de planning permet de créer des plannings hebdomadaires optimisés pour tous les employés d'un département, en tenant compte des heures d'ouverture, des congés, des préférences individuelles et d'autres contraintes.

## Point d'entrée de l'API

```
POST /api/schedule/auto-generate
```

## Format des données d'entrée

L'API attend un objet JSON avec la structure suivante :

```json
{
  "weekStart": "2023-06-05", // Date de début de semaine (lundi) - OBLIGATOIRE
  "departmentId": 1, // ID du département concerné - OBLIGATOIRE
  "businessHours": {
    // Heures d'ouverture par jour de la semaine - OBLIGATOIRE
    "Monday": [9, 17], // Plage horaire [heure_début, heure_fin] - OBLIGATOIRE
    "Tuesday": [9, 17], // Les valeurs sont des entiers entre 0 et 24
    "Wednesday": [9, 17],
    "Thursday": [9, 17],
    "Friday": [9, 17],
    "Saturday": [10, 15], // Optionnel pour les jours de week-end
    "Sunday": [11, 15] // Optionnel pour les jours de week-end
  },
  "employeePreferences": {
    // Préférences horaires des employés - OPTIONNEL
    "1": {
      // ID de l'employé
      "Monday": [
        // Tableau de créneaux préférés pour ce jour
        {
          "start": 9, // Heure de début (entre 0 et 24)
          "end": 13 // Heure de fin (entre 0 et 24, > start)
        },
        {
          "start": 14,
          "end": 17
        }
      ],
      "Tuesday": [
        {
          "start": 10,
          "end": 18
        }
      ]
      // Autres jours de la semaine...
    },
    "2": {
      // Préférences de l'employé 2...
    }
    // Autres employés...
  },
  "sourceWeek": "2023-05-29", // Date de début d'une semaine à cloner - OPTIONNEL
  "minimumEmployees": 2, // Nombre minimum d'employés par créneau - OPTIONNEL (défaut: 1)
  "balanceRoles": true // Équilibrer les rôles - OPTIONNEL (défaut: true)
}
```

### Règles de validation

- La `weekStart` doit être une date valide au format YYYY-MM-DD (ISO 8601).
- Le `departmentId` doit être un entier positif.
- Les `businessHours` doivent définir des plages horaires pour au moins lundi à vendredi.
- Chaque plage horaire doit contenir exactement 2 valeurs (début et fin).
- Les heures doivent être des nombres entiers entre 0 et 24.
- Les préférences d'employés (`employeePreferences`) doivent avoir une structure cohérente.
- Chaque créneau préféré doit avoir une heure de début inférieure à l'heure de fin.
- Si fournie, `sourceWeek` doit être une date valide au format YYYY-MM-DD.
- Si fourni, `minimumEmployees` doit être un entier positif (≥ 1).
- Si fournie, `balanceRoles` doit être un booléen.

## Réponse de l'API

En cas de succès (HTTP 200), la réponse aura la structure suivante :

```json
{
  "success": true,
  "data": [
    {
      "employee_id": 1,
      "week_start": "2023-06-05",
      "schedule_data": {
        "Monday": [
          {
            "start": 9,
            "end": 17
          }
        ],
        "Tuesday": [
          {
            "start": 9,
            "end": 17
          }
        ]
        // Autres jours de la semaine...
      },
      "status": "draft"
    }
    // Autres employés...
  ],
  "stats": {
    "total_hours": {
      "1": 40,
      "2": 35
      // Autres employés...
    },
    "preference_match_rate": 0.85,
    "overworked_employees": [
      {
        "employee_id": 1,
        "name": "John Doe",
        "contract_hours": 35,
        "assigned_hours": 40,
        "difference": 5
      }
    ]
  }
}
```

## Erreurs

En cas d'erreur de validation des données (HTTP 400) :

```json
{
  "success": false,
  "message": "Données de requête invalides",
  "errors": [
    "La date de début de semaine est requise",
    "L'ID du département doit être positif"
    // Autres erreurs...
  ]
}
```

En cas d'erreur serveur (HTTP 500) :

```json
{
  "success": false,
  "message": "Erreur lors de la génération automatique",
  "error": "Message d'erreur spécifique"
}
```

## Notes techniques

- Le planning est généré en tenant compte des congés approuvés des employés.
- L'algorithme tente d'équilibrer le nombre d'heures entre les employés, en respectant leurs contrats.
- Le paramètre `balanceRoles` permet d'assurer une répartition équilibrée des rôles.
- Si une `sourceWeek` est fournie, le système tente de cloner cette semaine comme point de départ.
