## 🎨 Présentation du projet

SmartPlanning AI est une application de gestion de planning intelligente qui permet aux entreprises de gérer efficacement leurs employés, plannings, congés et statistiques. Cette refonte complète du design intègre des animations modernes et un style professionnel, tout en conservant une fluidité et une ergonomie optimale.

## ✨ Caractéristiques principales

### Design moderne et professionnel

- **Interface élégante** : Un design épuré et professionnel qui inspire confiance aux entreprises.
- **Expérience utilisateur fluide** : Navigation intuitive et interactions fluides.
- **Responsive design** : Adaptation parfaite sur desktop et mobile.

### Thèmes et personnalisation

- **Mode clair et sombre** : Transition fluide entre les deux modes avec des palettes de couleurs optimisées.
- **Personnalisation des couleurs** : Possibilité de personnaliser les couleurs des événements dans le planning.

### Animations et micro-interactions

- **Transitions de page** : Animations douces entre les différentes pages.
- **Micro-interactions** : Feedback visuel sur les boutons, formulaires et autres éléments interactifs.
- **Notifications animées** : Système de notification moderne avec animations d'entrée et de sortie.

### Composants UI modernes

- **Boutons interactifs** : Différentes variantes de boutons avec animations au survol et au clic.
- **Cartes élégantes** : Composants de carte avec ombres et animations.
- **Formulaires intuitifs** : Champs de formulaire avec validation et feedback visuel.
- **Tableaux dynamiques** : Tableaux de données avec tri, pagination et états vides stylisés.
- **Calendrier interactif** : Visualisation et gestion des événements avec un calendrier moderne.

## 🛠️ Structure technique

### Architecture des composants

- **Composants UI réutilisables** : Boutons, cartes, formulaires, tableaux, etc.
- **Composants de mise en page** : Navbar, conteneurs, grilles, etc.
- **Composants fonctionnels** : Calendrier, notifications, modals, etc.

### Système de design

- **Thème cohérent** : Variables de couleur, typographie, espacement, etc.
- **Animations standardisées** : Bibliothèque d'animations réutilisables.
- **Responsive design** : Points de rupture et adaptations pour différentes tailles d'écran.

### Technologies utilisées

- **React 18** - Bibliothèque JavaScript pour construire l'interface utilisateur
- **Material-UI 5** - Bibliothèque de composants React pour un design moderne
- **Redux Toolkit** - Gestion d'état global
- **React Router 6** - Navigation entre les pages
- **i18next** - Internationalisation
- **Recharts** - Visualisation de données
- **FullCalendar** - Composant calendrier avancé
- **Framer Motion** - Animations fluides
- **Axios** - Client HTTP pour les requêtes API
- **React Hook Form** - Gestion des formulaires

## 📱 Pages principales

### Tableau de bord

- Vue d'ensemble des statistiques clés.
- Activités récentes et événements à venir.
- Widgets interactifs pour un accès rapide aux fonctionnalités principales.

### Planning

- Calendrier interactif pour visualiser et gérer les événements.
- Filtres pour affiner la vue par employé, date, etc.
- Création et modification d'événements avec un formulaire intuitif.

### Employés

- Liste des employés avec recherche et filtres.
- Fiches détaillées des employés avec informations et statistiques.
- Gestion des compétences et disponibilités.

### Congés

- Visualisation des demandes de congés.
- Processus d'approbation/refus intuitif.
- Calendrier des absences pour une vue d'ensemble.

### Statistiques

- Graphiques et visualisations interactives.
- Filtres temporels pour analyser les données sur différentes périodes.
- Export des données et rapports.

## 🚀 Installation et démarrage

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation

1. **Cloner le projet**

```bash
git clone https://github.com/votre-username/smartplanning-ai.git
cd smartplanning-ai
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration de l'environnement**
   Copier le fichier `.env.example` en `.env` et configurer les variables :

```bash
cp .env.example .env
```

Variables d'environnement requises :

```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=smartplanningai
PORT=5001
FRONTEND_URL=http://localhost:5002
```

4. **Configuration de MySQL**

a. Installation de MySQL (macOS) :

```bash
brew install mysql
brew services start mysql
```

b. Installation de MySQL (Linux) :

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

c. Sécuriser l'installation :

```bash
mysql_secure_installation
```

5. **Initialisation de la base de données**

```bash
cd backend
node scripts/migrate.js
```

### Démarrage

1. **Démarrer le serveur backend**

```bash
npm run server
```

2. **Démarrer le frontend**

```bash
npm run client
```

3. **Démarrer les deux en même temps**

```bash
npm run dev
```

## 📚 Structure de la base de données

### Tables principales

1. **users**

   - Stocke les informations des utilisateurs de l'application
   - Champs principaux: `id`, `email`, `password`, `role`, `first_name`, `last_name`, `company`
   - Relations: référencé par de nombreuses tables comme clé étrangère

2. **user_settings**

   - Stocke les préférences des utilisateurs
   - Champs principaux: `id`, `user_id`, `theme_mode`, `language`, `notifications_enabled`
   - Relations: appartient à un utilisateur (`user_id` → `users.id`)

3. **departments**

   - Gère les départements de l'entreprise
   - Champs principaux: `id`, `name`, `description`, `manager_id`, `user_id`
   - Relations: appartient à un utilisateur (`user_id` → `users.id`)

4. **employees**

   - Stocke les informations des employés
   - Champs principaux: `id`, `user_id`, `first_name`, `last_name`, `email`, `department_id`, `manager_id`, `contractHours`
   - Relations:
     - Lié à un utilisateur (`user_id` → `users.id`)
     - Appartient à un département (`department_id` → `departments.id`)
     - A un manager (`manager_id` → `users.id`)

5. **weekly_schedules**

   - Gère les plannings hebdomadaires des employés
   - Champs principaux: `id`, `employee_id`, `week_start`, `week_end`, `schedule_data` (JSON), `total_hours`
   - Relations:
     - Appartient à un employé (`employee_id` → `employees.id`)
     - Créé par un utilisateur (`created_by` → `users.id`)
     - Modifié par un utilisateur (`updated_by` → `users.id`)

6. **vacation_requests**

   - Gère les demandes de congés des employés
   - Champs principaux: `id`, `employee_id`, `creator_id`, `start_date`, `end_date`, `type`, `status`
   - Relations:
     - Appartient à un employé (`employee_id` → `employees.id`)
     - Créé par un utilisateur (`creator_id` → `users.id`)
     - Approuvé par un utilisateur (`approved_by` → `users.id`)
     - Rejeté par un utilisateur (`rejected_by` → `users.id`)

7. **work_hours**

   - Enregistre les heures de travail réelles des employés
   - Champs principaux: `id`, `employee_id`, `date`, `expected_hours`, `actual_hours`, `balance`
   - Relations: appartient à un employé (`employee_id` → `employees.id`)

8. **activities**

   - Journalisation des activités des utilisateurs et des événements du système
   - Champs principaux: `id`, `type`, `entity_type`, `entity_id`, `description`, `user_id`, `details` (JSON)
   - Relations: effectuée par un utilisateur (`user_id` → `users.id`)

9. **notifications**

   - Gère les notifications envoyées aux utilisateurs
   - Champs principaux: `id`, `user_id`, `title`, `message`, `type`, `read`, `entity_type`, `entity_id`
   - Relations: destiné à un utilisateur (`user_id` → `users.id`)

10. **shifts**
    - Gère les horaires de travail des employés (shifts individuels)
    - Champs principaux: `id`, `employee_id`, `start_time`, `end_time`, `status`, `notes`
    - Relations:
      - Appartient à un employé (`employee_id` → `employees.id`)
      - Créé par un utilisateur (`created_by` → `users.id`)

### Triggers et procédures stockées

1. **work_hours_after_insert**

   - Déclenché après insertion dans la table `work_hours`
   - Calcule et met à jour le solde des heures de travail

2. **work_hours_after_update**

   - Déclenché après mise à jour dans la table `work_hours`
   - Recalcule et met à jour le solde des heures de travail

3. **work_hours_after_delete**

   - Déclenché après suppression dans la table `work_hours`
   - Ajuste le solde des heures de travail de l'employé

4. **calculate_weekly_schedule_hours**
   - Procédure qui calcule le total des heures d'un planning hebdomadaire
   - Analyse les données JSON du planning et met à jour le champ `total_hours`
   - Structure des données JSON attendue :
     ```json
     [
       {
         "type": "work",
         "hours": "8.0",
         "absence": null,
         "note": "",
         "timeSlots": [
           {
             "start": "09:00",
             "end": "17:00",
             "break": "1.0"
           }
         ]
       }
     ]
     ```
   - La procédure calcule le total en additionnant le champ `hours` de chaque jour
   - Mise à jour automatique du champ `total_hours` dans la table `weekly_schedules`

## 🛠 Technologies utilisées

### Frontend

- **React 18** - Bibliothèque JavaScript pour construire l'interface utilisateur
- **Material-UI 5** - Bibliothèque de composants React pour un design moderne
- **Redux Toolkit** - Gestion d'état global
- **React Router 6** - Navigation entre les pages
- **i18next** - Internationalisation
- **Recharts** - Visualisation de données
- **FullCalendar** - Composant calendrier avancé
- **Framer Motion** - Animations fluides
- **Axios** - Client HTTP pour les requêtes API
- **React Hook Form** - Gestion des formulaires

### Backend

- **Node.js** - Environnement d'exécution JavaScript côté serveur
- **Express** - Framework web pour Node.js
- **MySQL** - Base de données relationnelle
- **JSON Web Token** - Authentification sécurisée
- **Bcrypt** - Hachage des mots de passe
- **Joi** - Validation des données
- **Helmet** - Sécurité des en-têtes HTTP
- **node-nlp** - Traitement du langage naturel pour l'IA

### Outils de développement

- **Jest** - Tests unitaires et d'intégration
- **Supertest** - Tests d'API
- **Nodemon** - Rechargement automatique pendant le développement

## 📝 Scripts disponibles

- `npm run dev` : Démarre le frontend et le backend
- `npm run client` : Démarre uniquement le frontend
- `npm run server` : Démarre uniquement le backend
- `npm run migrate` : Exécute les migrations de la base de données
- `npm test` : Lance les tests
- `npm run build` : Crée une version de production

## 🔒 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Validation des entrées
- Gestion des rôles et permissions

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📝 Bonnes pratiques d'utilisation

### Performance

- Utiliser les composants de manière optimale pour éviter les re-rendus inutiles.
- Charger les données de manière asynchrone pour une expérience utilisateur fluide.

### Accessibilité

- Respecter les contrastes de couleur pour une meilleure lisibilité.
- Utiliser les attributs ARIA pour améliorer l'accessibilité.
- Assurer la navigation au clavier pour tous les éléments interactifs.

### Maintenance

- Suivre la structure de composants établie pour les nouvelles fonctionnalités.
- Utiliser les variables de thème pour maintenir la cohérence visuelle.
- Documenter les nouveaux composants et fonctionnalités.

## 🔮 Évolutions futures

- **Intégration d'IA** : Suggestions intelligentes pour l'optimisation des plannings.
- **Mode hors ligne** : Fonctionnalités disponibles même sans connexion internet.
- **Applications mobiles natives** : Versions iOS et Android pour une expérience mobile optimale.
- **Intégrations tierces** : Connexion avec des outils de calendrier, RH, etc.

---

© 2023 SmartPlanning AI. Tous droits réservés.

## Structure des données de planning

### Format standard des données de planning

```javascript
{
  employeeId: number,           // ID de l'employé
  days: [                       // Tableau de 7 jours (lundi à dimanche)
    {
      type: string,             // "work" ou "absence"
      hours: string,            // Nombre d'heures travaillées (format "0.0")
      absence: string,          // Type d'absence (congé, maladie, etc.)
      note: string,             // Note ou commentaire
      timeSlots: [              // Créneaux horaires
        {
          start: string,        // Heure de début (format "HH:MM")
          end: string,          // Heure de fin (format "HH:MM")
          break: string         // Durée de la pause en heures (optionnel)
        }
      ]
    }
  ]
}
```

### Conversion des données

Pour assurer la cohérence des données dans toute l'application, utilisez les fonctions utilitaires dans `src/utils/scheduleUtils.js` :

- `standardizeScheduleData(schedule)` : Convertit les données de planning au format standard
- `parseScheduleFromApi(apiData)` : Analyse les données reçues de l'API
- `prepareScheduleForApi(schedule)` : Prépare les données pour l'envoi à l'API

## Optimisations et bonnes pratiques

### Props React transientes

Pour éviter les avertissements React concernant les props inconnues, utilisez des props transientes avec le préfixe `$` :

```jsx
// Mauvaise pratique
<StyledComponent center={true} size="large" />

// Bonne pratique
<StyledComponent $center={true} $size="large" />
```

### Optimisation des hooks React

Pour éviter les boucles infinies et les rendus inutiles :

1. Utilisez `useCallback` pour les fonctions passées comme props
2. Utilisez `useMemo` pour les calculs coûteux
3. Optimisez les dépendances des hooks `useEffect` et `useMemo`
4. Utilisez `useRef` pour stocker des valeurs qui ne déclenchent pas de re-rendu

### Gestion des erreurs

L'application implémente une stratégie de retry pour les requêtes API échouées :

1. Tentatives multiples avec délai exponentiel
2. Messages d'erreur spécifiques
3. Mode de secours en cas d'échec répété

### WebSockets

L'application utilise les WebSockets pour les mises à jour en temps réel :

1. Notifications de création, mise à jour et suppression de plannings
2. Mode de secours automatique en cas d'indisponibilité du serveur WebSocket
3. Reconnexion automatique en cas de perte de connexion

## Développement

### Installation

```bash
npm install
```

### Démarrage du serveur de développement

```bash
npm run dev
```

### Construction pour la production

```bash
npm run build
```

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

## Déploiement avec Docker

smartplanningai peut être facilement déployé en utilisant Docker et Docker Compose.

### Prérequis

- Docker (version 20.10.0 ou plus récente)
- Docker Compose (version 2.0.0 ou plus récente)
- Git

### Installation et déploiement

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/votre-utilisateur/SmartPlanningA4.git
   cd SmartPlanningA4
   ```

2. Démarrez l'application avec Docker Compose :

   ```bash
   docker-compose up -d
   ```

3. Accédez à l'application :
   - Frontend : http://localhost:8080
   - Backend API : http://localhost:5001

### Configuration

Toutes les variables d'environnement sont configurées dans le fichier `docker-compose.yml`. Vous pouvez les modifier selon vos besoins avant le démarrage des conteneurs.

### Gestion des volumes

L'application utilise trois volumes Docker pour la persistance des données :

- `frontend-build` : Stocke les fichiers statiques du frontend
- `backend-data` : Stocke les logs du backend
- `db-data` : Stocke les données MySQL

### Déploiement continu

L'application est configurée avec Watchtower pour mettre à jour automatiquement les conteneurs lorsque de nouvelles images sont disponibles. Les conteneurs sont vérifiés toutes les 30 secondes.

Pour un déploiement automatique depuis GitHub :

1. Configurez les secrets GitHub suivants dans votre dépôt :

   - `SSH_PRIVATE_KEY` : Clé SSH privée pour se connecter au serveur
   - `SSH_HOST` : Adresse IP ou nom d'hôte du serveur
   - `SSH_USER` : Nom d'utilisateur SSH
   - `PROJECT_PATH` : Chemin vers le projet sur le serveur

2. Chaque push sur la branche `main` déclenchera un déploiement automatique via GitHub Actions.

### Commandes utiles

- Reconstruire les conteneurs : `docker-compose build`
- Démarrer les conteneurs : `docker-compose up -d`
- Arrêter les conteneurs : `docker-compose down`
- Voir les logs : `docker-compose logs -f`
- Redémarrer un service spécifique : `docker-compose restart [service]`

## 📂 Structure du projet

### Frontend (React)

```
src/
├── animations/    # Animations et transitions
├── assets/        # Images, icônes et autres fichiers statiques
├── components/    # Composants réutilisables
├── config/        # Configuration du frontend
├── contexts/      # Context API pour la gestion d'état global
├── hooks/         # Custom hooks React
├── layouts/       # Layouts de page
├── pages/         # Composants de page
├── services/      # Services d'API
├── styles/        # Fichiers CSS et styles
├── utils/         # Fonctions utilitaires
├── App.js         # Composant racine
├── i18n.js        # Configuration internationalisation
├── index.js       # Point d'entrée
├── setupProxy.js  # Configuration du proxy pour le développement
└── theme.js       # Thème et styles globaux
```

### Backend (Node.js)

```
backend/
├── config/        # Configuration du serveur
├── controllers/   # Contrôleurs pour les routes
├── database/      # Scripts et migrations de base de données
├── middleware/    # Middlewares Express
├── migrations/    # Fichiers de migration de la base de données
├── models/        # Modèles de données
├── routes/        # Définitions des routes API
├── scripts/       # Scripts utilitaires
├── services/      # Services métier
├── utils/         # Fonctions utilitaires
├── app.js         # Configuration de l'application Express
└── server.js      # Point d'entrée du serveur
```

## Test du Chatbot SmartPlanningAI

Le système intègre un chatbot intelligent capable de répondre à deux types de questions :

1. **Questions standards (FAQ interne)** - Réponses prédéfinies sur l'utilisation de l'application
2. **Questions personnalisées** - Réponses dynamiques basées sur des données de la base MySQL

### Pour tester le chatbot

1. **Installer les dépendances**

   ```bash
   npm install node-fetch@2
   ```

2. **Exécuter le script de test manuel**

   ```bash
   node __tests__/manuel-test-chatbot.js
   ```

3. **Se connecter avec un compte utilisateur valide**

   - Utilisez un compte administrateur pour tester toutes les fonctionnalités
   - Utilisez un compte employé pour tester les requêtes personnelles

4. **Exemples de questions à tester**:
   - Standards: "Bonjour", "Comment créer un planning ?", "Comment poser un congé ?"
   - Données dynamiques: "Qui travaille aujourd'hui ?", "Quel est mon solde de congés ?"

## Introduction

SmartPlanning est une application web de gestion de planning, congés et personnel pour les petites et moyennes entreprises.
