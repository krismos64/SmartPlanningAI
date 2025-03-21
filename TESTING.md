# Documentation de Test - SmartPlanningAI

## 🧪 1. Introduction

Cette documentation présente le système de tests automatisés mis en place pour le backend de SmartPlanningAI. Notre objectif est d'assurer la qualité, la stabilité et la fiabilité de l'API à travers une suite de tests complète.

Tous les tests sont automatisés avec **Jest**, couvrant à la fois les tests unitaires pour les modèles et les tests d'intégration pour les routes API. Les requêtes HTTP sont simulées avec **Supertest**, permettant de tester l'API sans avoir besoin d'un serveur en cours d'exécution.

## 📦 2. Structure des tests

Notre suite de tests est organisée selon la structure suivante:

```
__tests__/
├── models/
│   ├── Employee.test.js       # Tests unitaires du modèle Employee
│   ├── Department.test.js     # Tests unitaires du modèle Department
│   └── VacationRequest.test.js # Tests unitaires du modèle VacationRequest
├── routes/
│   ├── auth.test.js           # Tests d'intégration des routes d'authentification
│   ├── departments.test.js    # Tests d'intégration des routes de départements
│   ├── employees.test.js      # Tests d'intégration des routes d'employés
│   └── vacations.test.js      # Tests d'intégration des routes de congés
└── setup.js                   # Configuration globale des mocks
```

Chaque fichier de test est conçu pour fonctionner de manière isolée, avec ses propres mocks et configurations spécifiques.

## 🧰 3. Technologies utilisées

### Jest

Framework de test principal pour JavaScript avec une syntaxe descriptive:

- `describe()` pour regrouper les tests liés
- `it()` ou `test()` pour définir un cas de test spécifique
- `expect()` pour les assertions
- `beforeEach()` pour réinitialiser les mocks avant chaque test

### Supertest

Bibliothèque qui fournit une interface fluide pour les tests HTTP:

```javascript
request(app)
  .get("/api/departments")
  .set("Authorization", "Bearer token")
  .expect(200)
  .then((response) => {
    // Assertions sur la réponse
  });
```

### Techniques de Mock

- `jest.mock()` pour remplacer les modules entiers
- `mockResolvedValueOnce()` pour simuler des appels asynchrones
- Mocks spécifiques pour la base de données, les middlewares d'authentification et les modules de sécurité:

```javascript
jest.mock("../middleware/auth", () => ({
  auth: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
}));

jest.mock("../config/db", () => ({
  execute: jest.fn(),
  query: jest.fn(),
}));
```

## 🔒 4. Authentification & sécurité

### Simulation de l'authentification

Le middleware `auth` est mocké dans tous les tests de routes pour simuler un administrateur connecté:

```javascript
req.user = { id: 1, role: "admin" };
```

### Middleware CSRF

Le middleware CSRF est désactivé pendant les tests pour éviter les validations de token:

```javascript
jest.mock("../middleware/csrf", () => ({
  csrfProtection: (req, res, next) => next(),
}));
```

### Vérification des autorisations

Des tests spécifiques vérifient la logique d'accès basée sur le `manager_id`:

- Accès autorisé lorsque le manager_id correspond à l'utilisateur connecté
- Erreur 403 (Forbidden) lorsque l'accès est tenté sur des ressources non autorisées
- Vérification des rôles avec le middleware `checkRole`

## ✅ 5. Ce qui est testé

### Tests des modèles

Les modèles sont testés unitairement pour vérifier:

#### Construction et initialisation

- Création correcte des instances avec propriétés attendues
- Valeurs par défaut appliquées correctement

#### Méthodes CRUD

- `save()`: création et mise à jour des entités
- `find()`, `findById()`, `findByManager()`: récupération des données
- `delete()`: suppression des entités
- `update()`: mise à jour des entités existantes

#### Gestion des erreurs

- Comportement lorsque la base de données est indisponible
- Validation des données d'entrée
- Gestion des cas où les entités n'existent pas

### Tests des routes

Les routes API sont testées pour vérifier:

#### Routes d'authentification (/api/auth)

- Login avec identifiants valides et invalides
- Logout
- Récupération de l'administrateur courant

#### Routes d'employés (/api/employees)

- Récupération de tous les employés liés à un manager
- Récupération d'un employé spécifique
- Création d'un nouvel employé
- Mise à jour d'un employé existant
- Suppression d'un employé

#### Routes de congés (/api/vacations)

- Demandes de congés filtrées par manager
- Création de nouvelles demandes
- Mise à jour du statut (approuvé, rejeté)
- Suppression de demandes

#### Routes de départements (/api/departments)

- Récupération de tous les départements
- Récupération d'un département spécifique
- Création d'un nouveau département
- Récupération des employés d'un département
- Mise à jour et suppression de départements

#### Vérification des réponses HTTP

Tous les tests vérifient les codes de statut HTTP appropriés:

- 200: Succès
- 201: Création réussie
- 400: Requête invalide
- 401: Non authentifié
- 403: Accès interdit (non autorisé)
- 404: Ressource non trouvée
- 500: Erreur serveur

## 🧪 6. Lancer les tests

### Commande de base

Pour exécuter tous les tests:

```bash
npm test
```

### Exécuter des tests spécifiques

Pour exécuter des tests spécifiques par motif:

```bash
npm test -- --testPathPattern=routes/employees
```

### Avec rapport de couverture

Pour générer un rapport de couverture de code:

```bash
npm test -- --coverage
```

### Exécution avec forçage de la sortie

Pour éviter les problèmes de "handles" ouverts liés à MySQL:

```bash
npm test -- --forceExit --detectOpenHandles
```

## ⚠️ 7. Particularités

### Erreurs simulées

Certains tests simulent délibérément des erreurs de base de données ou des cas d'échec. Des messages d'erreur dans la console sont donc attendus pendant l'exécution des tests:

```javascript
// Test simulant une erreur de base de données
db.execute.mockRejectedValueOnce(new Error("Database error"));
await expect(Employee.findByManager(managerId)).rejects.toThrow(
  "Database error"
);
```

### Environnement de test

Les tests utilisent une configuration spécifique définie par la variable d'environnement:

```
NODE_ENV=test
```

Cette configuration utilise généralement une base de données dédiée aux tests pour éviter d'affecter les données de production ou de développement.

## 📁 8. Structure de réponse API attendue

Tous les tests sont conçus pour vérifier que les réponses API suivent le format standardisé:

```json
{
  "success": true,
  "message": "Message informatif sur l'opération",
  "data": {
    // Données spécifiques à l'opération
  }
}
```

En cas d'erreur:

```json
{
  "success": false,
  "message": "Description détaillée de l'erreur",
  "error": {
    // Détails de l'erreur (optionnel)
  }
}
```

Cette structure uniforme facilite la gestion des réponses côté client et améliore la maintenabilité de l'API.

## 🧩 9. Limitations et améliorations futures

### Améliorations envisagées

- **Tests de rôles supplémentaires**: Tester la logique d'autorisation pour des rôles supplémentaires lorsqu'ils seront implémentés.
- **Intégration CI/CD**: Configurer GitHub Actions ou autre service CI pour exécuter automatiquement les tests à chaque commit.
- **Tests de performance**: Ajouter des tests de charge et de performance pour évaluer les limites de l'API.
- **Tests end-to-end**: Implémenter des tests qui intègrent le frontend et le backend pour une validation complète.
- **Amélioration de la couverture**: Atteindre une couverture de code de 80% minimum pour toutes les parties critiques de l'application.

### Limitations actuelles

- Les interactions avec les services externes ne sont pas complètement testées.
- Certains scénarios complexes d'erreur réseau ne sont pas couverts.
- Les tests ne vérifient pas la performance sous charge élevée.

---

Ce document sera mis à jour régulièrement pour refléter l'évolution de la suite de tests et les nouvelles fonctionnalités testées.
