# SmartPlanning AI - Refonte UI/UX

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

- **React** : Bibliothèque JavaScript pour construire l'interface utilisateur.
- **Styled Components** : CSS-in-JS pour le styling des composants.
- **React Router** : Gestion des routes et de la navigation.
- **Context API** : Gestion de l'état global (thème, notifications, etc.).

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
DB_NAME=SmartPlanningAI
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

   - Gestion des utilisateurs et authentification
   - Rôles : admin, manager, employee

2. **employees**

   - Informations détaillées sur les employés
   - Lié à la table users

3. **plannings**

   - Plannings généraux
   - Peut contenir plusieurs événements

4. **planning_events**

   - Événements spécifiques dans les plannings
   - Types : shift, meeting, training, other

5. **vacation_requests**
   - Demandes de congés
   - Statuts : pending, approved, rejected

## 🛠 Technologies utilisées

- **Frontend**

  - React
  - Styled Components
  - TailwindCSS
  - React Router

- **Backend**
  - Node.js
  - Express
  - MySQL
  - JWT pour l'authentification

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

SmartPlanningAI peut être facilement déployé en utilisant Docker et Docker Compose.

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
