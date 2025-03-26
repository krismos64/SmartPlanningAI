# Algorithme de Génération Automatique de Planning

## Introduction

L'algorithme de génération automatique de planning est un composant central de SmartPlanningAI. Ce document décrit son fonctionnement, ses phases et les stratégies d'optimisation implémentées.

## Vue d'ensemble de l'algorithme

Notre algorithme heuristique multi-phases permet de générer des plannings hebdomadaires optimisés pour tous les employés d'un département, en tenant compte de diverses contraintes:

- Heures d'ouverture par jour de la semaine
- Congés approuvés des employés
- Préférences horaires individuelles
- Nombre minimal d'employés requis par créneau
- Équilibrage des rôles dans l'équipe
- Heures contractuelles de chaque employé

L'algorithme cherche à maximiser le respect des préférences tout en assurant une répartition équitable des heures et une couverture suffisante des plages horaires d'ouverture.

## Architecture et flux de données

Le processus de génération se décompose comme suit:

1. **Initialisation des données**:

   - Récupération des employés actifs
   - Récupération des congés approuvés
   - Création d'une matrice de disponibilité

2. **Génération du planning**:

   - Si une semaine source est fournie, elle sert de point de départ
   - Sinon, génération complète d'un nouveau planning optimisé

3. **Optimisation et validation**:

   - Ajustements pour respecter les contraintes minimales
   - Équilibrage des heures entre employés
   - Calcul des métriques de qualité

4. **Formatage et retour des résultats**:
   - Planning hebdomadaire par employé
   - Statistiques (heures totales, taux de satisfaction des préférences, etc.)

## Phases détaillées de l'algorithme

### Phase 1: Initialisation et préparation des données

```
Entrées:
- weekStart: Date de début de semaine
- departmentId: ID du département
- businessHours: Heures d'ouverture par jour
- employeePreferences: Préférences des employés (optionnel)
- minimumEmployees: Nombre minimum d'employés par créneau
- balanceRoles: Indicateur d'équilibrage des rôles
```

1. Récupération des employés actifs du département avec leurs contraintes contractuelles
2. Récupération des congés approuvés pour la période
3. Construction d'une matrice de disponibilité pour chaque employé et chaque heure
4. Initialisation des structures de données pour le planning

### Phase 2: Allocation initiale intelligente

Cette phase crée une première version du planning, en privilégiant:

1. Respect des préférences individuelles des employés
2. Répartition équilibrée des heures selon les contrats
3. Équilibrage des rôles si demandé

Algorithme d'allocation initiale:

```
Pour chaque jour ouvré:
  1. Créer des créneaux standard (généralement de 4h)
  2. Pour chaque employé ayant des préférences:
     - Tenter d'assigner l'employé selon ses préférences si:
       * Il est disponible (pas en congé)
       * Les heures ne dépassent pas son contrat (avec tolérance)
  3. Compléter pour atteindre le minimum d'employés:
     - Identifier les créneaux sous-staffés
     - Sélectionner les employés disponibles en prioritisant:
       * Ceux ayant le moins d'heures attribuées
       * La diversité des rôles si balanceRoles=true
```

### Phase 3: Optimisation locale

Cette phase améliore itérativement le planning par recherche locale:

1. Évaluation du planning selon une fonction de score multi-critères
2. Tentatives d'échanges de créneaux entre paires d'employés
3. Conservation uniquement des modifications améliorant le score global

Algorithme d'optimisation:

```
Initialiser score = évaluer(planning)
Pour max_iterations:
  Pour chaque jour:
    Pour chaque paire d'employés (A, B):
      Échanger les créneaux de A et B
      nouveau_score = évaluer(planning)
      Si nouveau_score > score:
        score = nouveau_score
        Conserver l'échange
      Sinon:
        Annuler l'échange
```

Fonction d'évaluation:

```
score = 100  // Score de base

// Pénalité pour écart avec heures contractuelles
Pour chaque employé:
  diff = |heures_attribuées - heures_contrat|
  Si heures_attribuées > heures_contrat:
    score -= diff * 2  // Pénalité plus forte pour les heures supplémentaires
  Sinon:
    score -= diff

// Bonus pour le respect des préférences
Si préférences exprimées:
  taux_satisfaction = préférences_satisfaites / total_préférences
  score += taux_satisfaction * 50

// Pénalité pour couverture insuffisante
Pour chaque créneau horaire:
  Si employés_présents < minimum_requis:
    score -= 5 * (minimum_requis - employés_présents)
```

### Phase 4: Vérification de la couverture

Cette phase assure que chaque créneau horaire est correctement couvert:

1. Pour chaque heure d'ouverture, vérification du nombre d'employés présents
2. Ajout de créneaux courts (1h) pour les heures sous-staffées
3. Priorité aux employés ayant le moins d'heures attribuées

### Phase 5: Calcul des métriques finales

Cette phase calcule les indicateurs de performance:

1. Taux de satisfaction des préférences
2. Identification des employés en surcharge
3. Distribution des heures par employé

## Gestion des contraintes spéciales

### Semaine source (clonage d'un planning existant)

Si une semaine source est fournie, l'algorithme:

1. Récupère les plannings existants pour cette semaine
2. Les copie comme base pour la nouvelle semaine, en tenant compte des congés
3. Complète les créneaux manquants avec l'algorithme d'optimisation

### Équilibrage des rôles

Lorsque `balanceRoles = true`, l'algorithme:

1. Identifie les différents rôles présents dans l'équipe
2. S'assure que chaque créneau contient au moins un représentant de chaque rôle si possible
3. Évite la concentration d'un même rôle sur un même créneau

## Paramètres et ajustements

L'algorithme comporte plusieurs paramètres ajustables:

- **Tolérance de dépassement des heures contractuelles**: 20% par défaut
- **Durée standard des créneaux**: 4 heures par défaut
- **Nombre d'itérations d'optimisation**: 100 par défaut
- **Poids des différents critères d'évaluation**: personnalisables

## Algorithme en pseudo-code simplifié

```
function générerPlanning(options):
  employés = récupérerEmployésActifs(options.departmentId)
  congés = récupérerCongésApprouvés(employés, options.weekStart)
  matrice_disponibilité = générerMatriceDisponibilité(employés, congés, options.businessHours)

  // Initialisation du planning
  planning = {}
  heures_par_employé = {}

  // Si semaine source fournie
  if options.sourceWeek:
    planning_source = récupérerPlanningSource(options.departmentId, options.sourceWeek)
    planning = appliquerPlanningSource(planning_source, matrice_disponibilité)

  // Allocation initiale
  planning = allocationInitiale(
    planning,
    employés,
    options.businessHours,
    matrice_disponibilité,
    options.employeePreferences,
    options.minimumEmployees,
    options.balanceRoles
  )

  // Optimisation locale
  planning = optimisationLocale(
    planning,
    employés,
    options.businessHours,
    matrice_disponibilité,
    options.employeePreferences,
    options.minimumEmployees
  )

  // Vérification couverture
  planning = assurerCouverture(
    planning,
    employés,
    options.businessHours,
    matrice_disponibilité,
    options.minimumEmployees
  )

  // Calcul métriques
  métriques = calculerMétriques(planning, employés, options.employeePreferences)

  // Formatage résultat
  return formaterRésultat(planning, employés, options.weekStart, métriques)
```

## Conclusion

L'algorithme de génération automatique de planning représente un compromis entre différentes contraintes parfois contradictoires. Sa conception modulaire permet des ajustements et améliorations futures, notamment:

- Intégration de modèles prédictifs pour anticiper les besoins en personnel
- Ajout de contraintes supplémentaires (compétences spécifiques, formation en binôme)
- Optimisation distribuée pour de très grandes équipes

# Documentation de l'Algorithme d'Optimisation de Planning

## Introduction

L'algorithme d'optimisation de planning implémenté dans `scheduleOptimization.js` est une approche heuristique multi-phase conçue pour générer des plannings hebdomadaires optimisés en tenant compte de multiples contraintes, notamment :

- Les heures d'ouverture de l'entreprise
- Les préférences horaires des employés
- Les congés validés
- Les heures contractuelles de chaque employé
- Le nombre minimum d'employés requis par créneau
- L'équilibrage des rôles professionnels (optionnel)

Cet algorithme s'appuie sur une approche d'optimisation locale pour améliorer progressivement une solution initiale jusqu'à atteindre un planning de haute qualité.

## Aperçu de la Structure

L'algorithme se décompose en quatre phases principales :

1. **Initialisation rigoureuse des données**
2. **Attribution initiale heuristique**
3. **Optimisation locale avancée**
4. **Validation finale et calcul des métriques**

Ces phases sont orchestrées par la fonction principale `optimizeSchedule()`, qui prend en entrée les options de configuration et retourne un planning optimisé avec des statistiques détaillées.

## Phase 1: Initialisation des Données

### Objectif

Préparer toutes les structures de données nécessaires et déterminer avec précision les disponibilités des employés.

### Étapes clés

#### 1.1 Initialisation des structures

- `scheduleData`: Structure principale du planning, organisée par jour puis par employé
- `employeeHours`: Compteur d'heures attribuées à chaque employé

#### 1.2 Matrice de disponibilité

La fonction `generateAvailabilityMatrix()` crée une matrice tridimensionnelle `[jour][employé][heure]` indiquant la disponibilité de chaque employé pour chaque heure de la semaine :

- Prend en compte les congés validés
- Intègre les préférences des employés avec différents niveaux de priorité
- Consulte les préférences de shifts enregistrées dans le profil de chaque employé

#### 1.3 Identification des périodes critiques

La fonction `identifyCriticalPeriods()` identifie les créneaux horaires où peu d'employés sont disponibles, permettant de prioriser ces périodes lors de l'attribution initiale.

```javascript
// Exemple de structure de la matrice de disponibilité
availability = {
  "Monday": {
    1: {9: 1, 10: 1, 11: 0.5, ...}, // Employé 1, valeur 1 = disponible, 0.5 = disponible mais non préféré, 0 = indisponible
    2: {9: 0, 10: 0, 11: 1, ...},   // Employé 2
    // ...
  },
  // Autres jours...
}
```

## Phase 2: Attribution Initiale Heuristique

### Objectif

Construire un planning initial de qualité en affectant intelligemment les créneaux horaires aux employés.

### Étapes clés

#### 2.1 Allocation des périodes critiques

La fonction `allocateCriticalPeriods()` attribue en priorité les créneaux identifiés comme difficiles à couvrir :

- Crée des shifts de 3-4h centrés sur les heures critiques
- Sélectionne les employés les plus adaptés en fonction de leurs heures déjà attribuées
- Marque ces shifts comme "critiques" pour préserver ces attributions lors des optimisations

#### 2.2 Création des shifts optimaux

La fonction `createOptimalShifts()` génère des shifts adaptés aux heures d'ouverture :

- Pour les journées courtes (<4h) : un seul shift couvrant toute la journée
- Pour les journées moyennes (4-6h) : deux shifts qui se chevauchent
- Pour les journées longues (>6h) : trois shifts ou plus avec chevauchements pour assurer une transition fluide

#### 2.3 Attribution selon les préférences

La fonction `assignPreferredShifts()` attribue les shifts en privilégiant :

- Les préférences explicites des employés
- L'équilibre des heures contractuelles
- La minimisation des heures supplémentaires

#### 2.4 Couverture minimale

La fonction `ensureMinimumEmployees()` s'assure que chaque créneau horaire est couvert par le nombre minimum d'employés requis :

- Identifie les créneaux sous-staffés
- Attribue des shifts complémentaires aux employés disponibles
- Privilégie les employés ayant moins d'heures déjà attribuées

## Phase 3: Optimisation Locale Avancée

### Objectif

Améliorer itérativement le planning initial à l'aide de techniques d'optimisation locale.

### Étapes clés

#### 3.1 Équilibrage des heures

La fonction `tryBalanceHours()` tente de transférer des shifts des employés en sur-heures vers ceux en sous-heures :

- Identifie les employés dont les heures attribuées s'écartent significativement de leur contrat
- Transfère les shifts les moins prioritaires (non préférés, non critiques)
- Maintient la qualité globale du planning

#### 3.2 Amélioration des préférences

La fonction `tryImprovePreferences()` cherche à augmenter le respect des préférences par des échanges de shifts entre employés :

- Évalue l'impact potentiel de chaque échange sur la satisfaction des préférences
- N'effectue que les échanges améliorant le score global
- Vérifie la faisabilité (disponibilité, absence de chevauchements)

#### 3.3 Équilibrage des rôles

La fonction `tryBalanceRoles()` (activée si l'option `balanceRoles` est true) cherche à répartir équitablement les différents rôles sur chaque créneau horaire :

- Identifie les déséquilibres (rôles sur-représentés ou sous-représentés)
- Tente des échanges pour améliorer la diversité des compétences présentes

L'optimisation s'effectue sur plusieurs itérations (jusqu'à 200 par défaut), avec une évaluation du score global à chaque itération :

- Si le score s'améliore, l'algorithme continue
- Si aucune amélioration n'est possible, l'algorithme s'arrête

## Phase 4: Validation Finale et Métriques

### Objectif

S'assurer que toutes les contraintes sont respectées et générer des statistiques détaillées sur le planning.

### Étapes clés

#### 4.1 Validation des contraintes

La fonction `ensureCoverage()` vérifie une dernière fois la couverture minimale et ajoute des shifts d'urgence si nécessaire :

- Identifie les créneaux non couverts par le minimum d'employés requis
- Crée des shifts d'urgence pour combler les lacunes
- Ajuste les shifts existants si nécessaire

#### 4.2 Équilibrage final

La fonction `balanceWorkload()` tente de réduire les heures supplémentaires excessives :

- Cible les employés avec >5h au-dessus de leur contrat
- Réduit la durée des shifts les moins prioritaires
- Maintient une durée minimale de 2h par shift

#### 4.3 Calcul des métriques

La fonction `calculateMetrics()` génère des statistiques détaillées :

- Total des heures par employé
- Taux de respect des préférences
- Liste des employés en surcharge de travail
- Heures non couvertes (le cas échéant)
- Moyenne d'heures hebdomadaires

```javascript
// Exemple de métriques retournées
metrics = {
  total_hours: { 1: 38, 2: 40, 3: 35 }, // Heures par employé
  preference_match_rate: 0.85, // 85% des préférences respectées
  overworked_employees: [
    // Employés en surcharge
    {
      id: 2,
      name: "Jane Doe",
      assigned_hours: 40,
      target_hours: 35,
      excess_hours: 5,
    },
  ],
  uncovered_hours: null, // Aucune heure non couverte
  average_weekly_hours: 37.7, // Moyenne des heures
};
```

## Évaluation du Planning

L'algorithme utilise plusieurs fonctions d'évaluation pour mesurer la qualité des plannings générés :

### Fonction d'évaluation globale

`evaluateSchedule()` calcule un score composite tenant compte de :

- Le respect des heures contractuelles (±50 points)
- Le respect des préférences des employés (±50 points)
- La couverture minimale (-100 à +50 points, impact critique)
- L'équilibre des rôles si activé (±25 points)

### Sous-fonctions d'évaluation

- `evaluateContractHours()` : Évalue l'écart entre heures attribuées et contractuelles
- `evaluatePreferences()` : Calcule le taux de satisfaction des préférences
- `evaluateCoverage()` : Vérifie le respect de la couverture minimale
- `evaluateRoleBalance()` : Mesure l'équilibre des rôles par créneau

## Structure du Résultat

Le résultat final de l'algorithme est un objet contenant :

```javascript
{
  scheduleData: {
    // Planning structuré par jour et par employé
    "Monday": {
      1: [{start: 9, end: 13, duration: 4, preferred: true}, ...],
      2: [{start: 12, end: 17, duration: 5, required: true}, ...],
      // ...
    },
    // Autres jours...
  },
  employeeHours: {
    // Heures totales attribuées par employé
    1: 38,
    2: 40,
    // ...
  },
  metrics: {
    // Statistiques détaillées (voir ci-dessus)
  }
}
```

## Optimisations et Améliorations

Plusieurs optimisations ont été intégrées pour améliorer la qualité des plannings :

1. **Préservation des shifts critiques** : Les shifts couvrant des périodes difficiles sont protégés lors des optimisations
2. **Optimisation multi-objectif** : Équilibre entre respect des préférences, équité des heures et couverture des besoins
3. **Approche itérative** : Amélioration progressive jusqu'à convergence vers une solution stable
4. **Prise en compte des préférences avec plusieurs niveaux de priorité** : Distinction entre shifts exactement préférés, partiellement préférés, etc.
5. **Minimisation des shifts courts** : Favorise des plages de travail cohérentes (minimum 2h)

## Limites et Perspectives

L'algorithme actuel présente certaines limites :

1. Il ne garantit pas une solution optimale globale (approche heuristique)
2. L'équilibrage des rôles pourrait être amélioré avec des techniques plus avancées
3. La prise en compte de contraintes légales spécifiques (temps de repos entre shifts) n'est pas entièrement implémentée

Des améliorations futures pourraient inclure :

- L'intégration d'algorithmes génétiques pour explorer plus largement l'espace des solutions
- La prise en compte de contraintes supplémentaires (compétences requises par créneau)
- L'optimisation des performances pour gérer des équipes plus grandes
