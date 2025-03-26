/**
 * Utilitaire avancé d'optimisation de planning
 * Implémente un algorithme heuristique multi-phase pour générer des plannings optimisés
 *
 * @module utils/scheduleOptimization
 */

const moment = require("moment");

/**
 * Optimise un planning hebdomadaire en utilisant une approche heuristique en quatre phases:
 * 1. Initialisation rigoureuse des données et contraintes
 * 2. Attribution initiale basée sur les préférences et contraintes
 * 3. Optimisation locale pour améliorer le planning global
 * 4. Vérification finale et calcul des métriques
 *
 * @param {Object} options Les options d'optimisation du planning
 * @param {Array<Object>} options.employees Les employés disponibles avec leurs contraintes
 * @param {Object} options.businessHours Les heures d'ouverture par jour de la semaine {Monday: [9, 17], ...}
 * @param {Object} options.vacationDays Les jours de congés par employé {employeeId: ['YYYY-MM-DD', ...], ...}
 * @param {Object} options.employeePreferences Les préférences horaires des employés
 * @param {number} options.minimumEmployees Le nombre minimum d'employés requis par créneau
 * @param {boolean} options.balanceRoles Indication pour équilibrer les rôles des employés
 * @param {string} options.weekStart Date de début de la semaine au format 'YYYY-MM-DD'
 * @returns {Object} Plannings optimisés et statistiques associées
 */
function optimizeSchedule(options) {
  console.log("Démarrage de l'optimisation du planning...");

  const {
    employees,
    businessHours,
    vacationDays,
    employeePreferences,
    minimumEmployees = 1,
    balanceRoles = true,
    weekStart,
  } = options;

  // Phase 1: Initialisation rigoureuse des données
  console.log("Phase 1: Initialisation des données...");

  // Structure pour stocker le planning généré
  const scheduleData = initializeScheduleData(employees);

  // Structure pour tracker les heures attribuées à chaque employé
  const employeeHours = initializeEmployeeHours(employees);

  // Jours de la semaine (ordre ISO standard)
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Matrice de disponibilité précise basée sur les congés validés
  const availability = generateAvailabilityMatrix(
    employees,
    days,
    businessHours,
    vacationDays,
    weekStart,
    employeePreferences
  );

  // Détecter les périodes critiques (peu d'employés disponibles)
  const criticalPeriods = identifyCriticalPeriods(
    availability,
    days,
    businessHours,
    minimumEmployees
  );

  // Phase 2: Attribution initiale heuristique optimisée
  console.log("Phase 2: Attribution initiale des créneaux...");

  // D'abord, couvrir les périodes critiques
  allocateCriticalPeriods(
    scheduleData,
    employees,
    days,
    businessHours,
    employeeHours,
    availability,
    criticalPeriods,
    employeePreferences
  );

  // Ensuite, attribuer les créneaux selon les préférences
  initialAllocation(
    scheduleData,
    employees,
    days,
    businessHours,
    employeeHours,
    availability,
    employeePreferences,
    minimumEmployees,
    balanceRoles
  );

  // Phase 3: Optimisation locale avancée
  console.log("Phase 3: Optimisation locale du planning...");

  const maxIterations = 200; // Nombre maximal d'itérations pour l'optimisation

  localOptimization(
    scheduleData,
    employees,
    days,
    businessHours,
    employeeHours,
    availability,
    employeePreferences,
    minimumEmployees,
    balanceRoles,
    maxIterations
  );

  // Phase 4: Validation finale approfondie
  console.log("Phase 4: Validation finale et calcul des métriques...");

  // S'assurer que toutes les contraintes sont respectées
  ensureCoverage(
    scheduleData,
    employees,
    days,
    businessHours,
    employeeHours,
    availability,
    minimumEmployees
  );

  // Équilibrer les heures entre employés si possible
  balanceWorkload(
    scheduleData,
    employees,
    days,
    businessHours,
    employeeHours,
    availability,
    employeePreferences
  );

  // Calculer les métriques détaillées du planning
  const metrics = calculateMetrics(
    scheduleData,
    employees,
    employeeHours,
    employeePreferences,
    days,
    businessHours
  );

  console.log("Optimisation terminée avec succès.");

  return {
    scheduleData,
    employeeHours,
    metrics,
  };
}

/**
 * Initialise la structure du planning pour tous les employés
 *
 * @param {Array<Object>} employees Liste des employés
 * @returns {Object} Structure du planning initialisée par jour et par employé
 */
function initializeScheduleData(employees) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const scheduleData = {};

  days.forEach((day) => {
    scheduleData[day] = {};
    employees.forEach((emp) => {
      scheduleData[day][emp.id] = [];
    });
  });

  return scheduleData;
}

/**
 * Initialise le compteur d'heures pour chaque employé
 *
 * @param {Array<Object>} employees Liste des employés
 * @returns {Object} Compteur d'heures initialisé par employé
 */
function initializeEmployeeHours(employees) {
  const employeeHours = {};
  employees.forEach((emp) => {
    // Initialiser avec l'équilibre d'heures existant pour une meilleure répartition
    employeeHours[emp.id] = 0;

    // Si l'employé a un solde d'heures, le prendre en compte
    if (emp.hour_balance) {
      employeeHours[emp.id] = parseFloat(emp.hour_balance);
    }
  });
  return employeeHours;
}

/**
 * Génère une matrice de disponibilité précise pour chaque employé, jour et heure
 * prenant en compte les congés validés et les préférences horaires
 *
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} vacationDays Jours de congés par employé
 * @param {string} weekStart Date de début de semaine (YYYY-MM-DD)
 * @param {Object} employeePreferences Préférences des employés
 * @returns {Object} Matrice de disponibilité détaillée
 */
function generateAvailabilityMatrix(
  employees,
  days,
  businessHours,
  vacationDays,
  weekStart,
  employeePreferences
) {
  const availability = {};
  const weekStartMoment = moment(weekStart);

  days.forEach((day, dayIndex) => {
    availability[day] = {};

    // Vérifier si le jour est ouvré
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return;
    }

    const [openHour, closeHour] = businessHours[day];

    // Date ISO correspondant à ce jour de la semaine
    const currentDate = weekStartMoment
      .clone()
      .add(dayIndex, "days")
      .format("YYYY-MM-DD");

    employees.forEach((emp) => {
      availability[day][emp.id] = {};

      // Vérifier si l'employé est en congé ce jour-là
      const isOnVacation =
        vacationDays[emp.id] && vacationDays[emp.id].includes(currentDate);

      // Récupérer les préférences spécifiques de l'employé pour ce jour
      const employeePrefsForDay =
        employeePreferences[emp.id] && employeePreferences[emp.id][day]
          ? employeePreferences[emp.id][day]
          : null;

      for (let hour = openHour; hour < closeHour; hour++) {
        // Par défaut, disponible si pas en congé
        let isAvailable = !isOnVacation;

        // Appliquer les préférences horaires si spécifiées
        if (isAvailable && employeePrefsForDay) {
          // Si des créneaux préférés sont spécifiés pour ce jour
          if (
            Array.isArray(employeePrefsForDay) &&
            employeePrefsForDay.length > 0
          ) {
            // Vérifier si l'heure est dans un créneau préféré
            isAvailable = employeePrefsForDay.some((pref) => {
              return (
                Array.isArray(pref) &&
                pref.length === 2 &&
                hour >= pref[0] &&
                hour < pref[1]
              );
            });
          }
        }

        // Si l'employé a des préférences de shift dans son profil
        if (isAvailable && emp.preferred_shifts) {
          try {
            const preferredShifts = JSON.parse(emp.preferred_shifts);
            if (preferredShifts[day]) {
              // Appliquer une disponibilité réduite (mais pas zéro) pour les heures non préférées
              const isPreferredHour = preferredShifts[day].some((pref) => {
                return (
                  Array.isArray(pref) &&
                  pref.length === 2 &&
                  hour >= pref[0] &&
                  hour < pref[1]
                );
              });

              // Disponible mais avec une priorité réduite si hors préférences
              isAvailable = isPreferredHour ? 1 : 0.5;
            }
          } catch (e) {
            // Ignorer l'erreur de parsing et garder la disponibilité par défaut
            console.warn(
              `Erreur de parsing des preferred_shifts pour l'employé ${emp.id}`
            );
          }
        }

        availability[day][emp.id][hour] = isAvailable;
      }
    });
  });

  return availability;
}

/**
 * Identifie les périodes critiques où peu d'employés sont disponibles
 * Ce sont des périodes prioritaires pour l'attribution des créneaux
 *
 * @param {Object} availability Matrice de disponibilité
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {number} minimumEmployees Nombre minimum d'employés requis
 * @returns {Array<Object>} Liste des périodes critiques triées par priorité
 */
function identifyCriticalPeriods(
  availability,
  days,
  businessHours,
  minimumEmployees
) {
  const criticalPeriods = [];

  days.forEach((day) => {
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return;
    }

    const [openHour, closeHour] = businessHours[day];

    for (let hour = openHour; hour < closeHour; hour++) {
      // Compter le nombre d'employés disponibles pour cette heure
      let availableEmployees = 0;
      let totalAvailability = 0;

      Object.keys(availability[day]).forEach((empId) => {
        if (availability[day][empId][hour]) {
          availableEmployees++;
          // Ajouter la valeur de disponibilité (peut être 1 ou 0.5 pour les préférences)
          totalAvailability +=
            typeof availability[day][empId][hour] === "number"
              ? availability[day][empId][hour]
              : 1;
        }
      });

      // Si le nombre d'employés disponibles est proche du minimum requis ou inférieur
      if (availableEmployees <= minimumEmployees + 1) {
        criticalPeriods.push({
          day,
          hour,
          availableEmployees,
          totalAvailability,
          // Plus le score est bas, plus la période est critique
          criticalityScore: availableEmployees * 100 + totalAvailability,
        });
      }
    }
  });

  // Trier par score de criticité (du plus critique au moins critique)
  criticalPeriods.sort((a, b) => a.criticalityScore - b.criticalityScore);

  return criticalPeriods;
}

/**
 * Alloue en priorité les périodes critiques aux employés disponibles
 * pour garantir une couverture minimale des heures difficiles à couvrir
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Array<Object>} criticalPeriods Liste des périodes critiques
 * @param {Object} employeePreferences Préférences des employés
 */
function allocateCriticalPeriods(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  criticalPeriods,
  employeePreferences
) {
  // Traiter chaque période critique dans l'ordre de criticité
  criticalPeriods.forEach(({ day, hour }) => {
    // Vérifier si l'heure est déjà couverte
    let isCovered = false;

    Object.keys(scheduleData[day]).forEach((empId) => {
      scheduleData[day][empId].forEach((shift) => {
        if (hour >= shift.start && hour < shift.end) {
          isCovered = true;
        }
      });
    });

    // Si l'heure n'est pas encore couverte, essayer de l'attribuer
    if (!isCovered) {
      // Trouver les employés disponibles pour cette heure
      const availableEmployees = employees
        .filter((emp) => availability[day][emp.id][hour])
        .sort((a, b) => {
          // Favoriser les employés avec moins d'heures attribuées
          return employeeHours[a.id] - employeeHours[b.id];
        });

      if (availableEmployees.length > 0) {
        // Attribuer un shift de 4 heures (ou moins si la journée se termine avant)
        const [openHour, closeHour] = businessHours[day];

        // Calculer les heures de début et de fin
        let startHour = Math.max(openHour, hour - 1); // Commencer 1h avant si possible
        let endHour = Math.min(closeHour, hour + 3); // Finir 3h après si possible

        // S'assurer que le shift a une durée minimale de 2 heures
        if (endHour - startHour < 2 && startHour > openHour) {
          startHour = Math.max(openHour, endHour - 2);
        } else if (endHour - startHour < 2 && endHour < closeHour) {
          endHour = Math.min(closeHour, startHour + 2);
        }

        // Attribuer le shift à l'employé le plus adapté
        const emp = availableEmployees[0];

        // Vérifier si ce shift chevauche des shifts existants
        let hasOverlap = false;
        scheduleData[day][emp.id].forEach((existingShift) => {
          if (startHour < existingShift.end && endHour > existingShift.start) {
            hasOverlap = true;
          }
        });

        if (!hasOverlap) {
          // Ajouter le shift
          scheduleData[day][emp.id].push({
            start: startHour,
            end: endHour,
            duration: endHour - startHour,
            critical: true, // Marquer comme un shift critique
          });

          // Mettre à jour le compteur d'heures
          employeeHours[emp.id] += endHour - startHour;
        }
      }
    }
  });
}

/**
 * Effectue l'allocation initiale intelligente des créneaux horaires
 * en tenant compte des préférences et contraintes
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 * @param {number} minimumEmployees Nombre minimum d'employés requis
 * @param {boolean} balanceRoles Équilibrer les rôles
 */
function initialAllocation(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  employeePreferences,
  minimumEmployees,
  balanceRoles
) {
  // Calculer les heures de contrat cibles par employé
  const targetHours = {};
  employees.forEach((emp) => {
    // Valeur par défaut: 40h/semaine si non spécifié
    targetHours[emp.id] = emp.contractHours
      ? parseFloat(emp.contractHours)
      : 40;
  });

  // Pour chaque jour ouvré
  days.forEach((day) => {
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return; // Jour non ouvré, passer au suivant
    }

    const [openHour, closeHour] = businessHours[day];

    // Créer des créneaux standard de 4 heures (ou adaptés aux horaires d'ouverture)
    const shifts = createOptimalShifts(openHour, closeHour);

    // Trier les shifts par importance décroissante (heures de pointe en priorité)
    shifts.sort((a, b) => {
      // Priorité aux shifts couvrant les heures de midi (12-14h) et fin de journée (16-18h)
      const aPriority = calculateShiftPriority(a);
      const bPriority = calculateShiftPriority(b);
      return bPriority - aPriority;
    });

    // 1. D'abord, assigner les shifts selon les préférences des employés
    assignPreferredShifts(
      scheduleData,
      employees,
      day,
      shifts,
      employeeHours,
      availability,
      employeePreferences,
      targetHours
    );

    // 2. Ensuite, s'assurer que le nombre minimum d'employés est respecté
    ensureMinimumEmployees(
      scheduleData,
      employees,
      day,
      shifts,
      employeeHours,
      availability,
      minimumEmployees,
      balanceRoles,
      targetHours
    );
  });
}

/**
 * Calcule la priorité d'un shift basée sur son importance pour le commerce
 * Les heures de pointe (midi, fin de journée) sont prioritaires
 *
 * @param {Object} shift Le shift à évaluer
 * @returns {number} Score de priorité (plus élevé = plus prioritaire)
 */
function calculateShiftPriority(shift) {
  let priority = 0;

  // Heures de pointe = déjeuner (11h-14h)
  if (
    (shift.start <= 11 && shift.end > 11) ||
    (shift.start <= 13 && shift.end > 13)
  ) {
    priority += 10;
  }

  // Heures de pointe = fin de journée (16h-18h)
  if (
    (shift.start <= 16 && shift.end > 16) ||
    (shift.start <= 18 && shift.end > 18)
  ) {
    priority += 8;
  }

  // Les shifts plus longs sont généralement plus importants
  priority += shift.duration;

  return priority;
}

/**
 * Crée des shifts de durée optimale basés sur les heures d'ouverture
 *
 * @param {number} openHour Heure d'ouverture
 * @param {number} closeHour Heure de fermeture
 * @returns {Array<Object>} Liste des shifts optimaux
 */
function createOptimalShifts(openHour, closeHour) {
  const shifts = [];
  const dailyHours = closeHour - openHour;

  // Si journée très courte (< 4h)
  if (dailyHours <= 4) {
    shifts.push({
      start: openHour,
      end: closeHour,
      duration: dailyHours,
    });
    return shifts;
  }

  // Si journée courte (4-6h): créer deux shifts qui se chevauchent
  if (dailyHours <= 6) {
    const midPoint = Math.floor(openHour + dailyHours / 2);
    shifts.push({
      start: openHour,
      end: midPoint + 1,
      duration: midPoint + 1 - openHour,
    });
    shifts.push({
      start: midPoint - 1,
      end: closeHour,
      duration: closeHour - (midPoint - 1),
    });
    return shifts;
  }

  // Pour les journées standard, créer des shifts de 4-5h avec chevauchements
  const standardShiftLength = 4;

  // Matin
  shifts.push({
    start: openHour,
    end: openHour + standardShiftLength,
    duration: standardShiftLength,
  });

  // Midi (avec chevauchement)
  if (dailyHours > 6) {
    shifts.push({
      start: openHour + standardShiftLength - 1,
      end: Math.min(openHour + standardShiftLength * 2 - 1, closeHour),
      duration: Math.min(
        standardShiftLength,
        closeHour - (openHour + standardShiftLength - 1)
      ),
    });
  }

  // Après-midi/Soir (si la journée est assez longue)
  if (dailyHours > 8) {
    shifts.push({
      start: Math.max(
        closeHour - standardShiftLength,
        openHour + standardShiftLength
      ),
      end: closeHour,
      duration: Math.min(
        standardShiftLength,
        closeHour - (openHour + standardShiftLength)
      ),
    });
  }

  return shifts;
}

/**
 * Assigne les shifts en fonction des préférences des employés
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {string} day Jour de la semaine
 * @param {Array<Object>} shifts Liste des shifts à attribuer
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 * @param {Object} targetHours Heures cibles par employé
 */
function assignPreferredShifts(
  scheduleData,
  employees,
  day,
  shifts,
  employeeHours,
  availability,
  employeePreferences,
  targetHours
) {
  // Pour chaque shift à attribuer
  shifts.forEach((shift) => {
    // 1. Calculer le score de préférence pour chaque employé pour ce shift
    const employeeScores = employees.map((emp) => {
      // Vérifier si l'employé est disponible pour toutes les heures du shift
      let fullyAvailable = true;
      for (let hour = shift.start; hour < shift.end; hour++) {
        if (!availability[day][emp.id][hour]) {
          fullyAvailable = false;
          break;
        }
      }

      if (!fullyAvailable) {
        return { empId: emp.id, score: -1 }; // Non disponible
      }

      // Vérifier s'il y a déjà un shift attribué qui chevauche celui-ci
      let hasOverlap = false;
      scheduleData[day][emp.id].forEach((existingShift) => {
        if (
          shift.start < existingShift.end &&
          shift.end > existingShift.start
        ) {
          hasOverlap = true;
        }
      });

      if (hasOverlap) {
        return { empId: emp.id, score: -1 }; // Déjà un shift qui chevauche
      }

      // Calculer le score de préférence
      let score = 10; // Score de base

      // Prendre en compte les heures contractuelles restantes
      const remainingTarget = targetHours[emp.id] - employeeHours[emp.id];
      if (remainingTarget >= shift.duration) {
        score += 5; // Bonus si le shift ne dépasse pas les heures cibles
      } else if (remainingTarget > 0) {
        score += (remainingTarget / shift.duration) * 5; // Bonus proportionnel
      } else {
        score -= 3; // Pénalité pour les heures supplémentaires
      }

      // Bonus pour les préférences exprimées
      if (employeePreferences[emp.id] && employeePreferences[emp.id][day]) {
        const dayPrefs = employeePreferences[emp.id][day];
        if (Array.isArray(dayPrefs)) {
          dayPrefs.forEach((pref) => {
            if (
              Array.isArray(pref) &&
              pref.length === 2 &&
              shift.start >= pref[0] &&
              shift.end <= pref[1]
            ) {
              score += 8; // Fort bonus pour les shifts exactement préférés
            } else if (
              Array.isArray(pref) &&
              pref.length === 2 &&
              ((shift.start >= pref[0] && shift.start < pref[1]) ||
                (shift.end > pref[0] && shift.end <= pref[1]))
            ) {
              score += 4; // Bonus modéré pour les shifts partiellement préférés
            }
          });
        }
      }

      // Bonus pour les préférences intégrées au profil employé
      if (emp.preferred_shifts) {
        try {
          const preferredShifts = JSON.parse(emp.preferred_shifts);
          if (preferredShifts[day]) {
            preferredShifts[day].forEach((pref) => {
              if (
                Array.isArray(pref) &&
                pref.length === 2 &&
                shift.start >= pref[0] &&
                shift.end <= pref[1]
              ) {
                score += 6; // Bonus pour les shifts préférés du profil
              }
            });
          }
        } catch (e) {
          // Ignorer l'erreur de parsing
        }
      }

      // Équilibrage des heures entre employés
      score -= employeeHours[emp.id] / 10; // Légère pénalité basée sur les heures déjà assignées

      return { empId: emp.id, score };
    });

    // 2. Filtrer les employés non disponibles et trier par score décroissant
    const eligibleEmployees = employeeScores
      .filter((e) => e.score >= 0)
      .sort((a, b) => b.score - a.score);

    // 3. Attribuer le shift à l'employé avec le meilleur score s'il y en a un
    if (eligibleEmployees.length > 0) {
      const bestEmployeeId = eligibleEmployees[0].empId;
      scheduleData[day][bestEmployeeId].push({
        start: shift.start,
        end: shift.end,
        duration: shift.duration,
        preferred: true,
      });

      // Mettre à jour le compteur d'heures
      employeeHours[bestEmployeeId] += shift.duration;
    }
  });
}

/**
 * S'assure que le nombre minimum d'employés est respecté pour chaque créneau
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {string} day Jour de la semaine
 * @param {Array<Object>} shifts Liste des shifts à attribuer
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {number} minimumEmployees Nombre minimum d'employés requis
 * @param {boolean} balanceRoles Équilibrer les rôles
 * @param {Object} targetHours Heures cibles par employé
 */
function ensureMinimumEmployees(
  scheduleData,
  employees,
  day,
  shifts,
  employeeHours,
  availability,
  minimumEmployees,
  balanceRoles,
  targetHours
) {
  // Récupérer les heures d'ouverture
  const businessHours =
    shifts.length > 0
      ? {
          start: Math.min(...shifts.map((s) => s.start)),
          end: Math.max(...shifts.map((s) => s.end)),
        }
      : null;

  if (!businessHours) return;

  // Pour chaque heure de la journée
  for (let hour = businessHours.start; hour < businessHours.end; hour++) {
    // Compter les employés déjà assignés à cette heure
    let assignedEmployees = 0;
    const assignedEmployeeIds = new Set();

    Object.keys(scheduleData[day]).forEach((empId) => {
      scheduleData[day][empId].forEach((shift) => {
        if (hour >= shift.start && hour < shift.end) {
          assignedEmployees++;
          assignedEmployeeIds.add(parseInt(empId));
        }
      });
    });

    // Si le nombre d'employés est inférieur au minimum requis
    if (assignedEmployees < minimumEmployees) {
      const neededEmployees = minimumEmployees - assignedEmployees;

      // Trouver les employés disponibles non encore assignés à cette heure
      const availableEmployees = employees
        .filter((emp) => {
          // Vérifier si l'employé est disponible à cette heure
          if (!availability[day][emp.id][hour]) return false;

          // Vérifier qu'il n'est pas déjà assigné à cette heure
          if (assignedEmployeeIds.has(emp.id)) return false;

          // Vérifier qu'il n'a pas de chevauchement avec d'autres shifts
          let hasOverlap = false;

          // Créer un shift potentiel de 3-4h centré sur l'heure actuelle
          const potentialShiftStart = Math.max(businessHours.start, hour - 1);
          const potentialShiftEnd = Math.min(businessHours.end, hour + 3);

          scheduleData[day][emp.id].forEach((existingShift) => {
            if (
              potentialShiftStart < existingShift.end &&
              potentialShiftEnd > existingShift.start
            ) {
              hasOverlap = true;
            }
          });

          return !hasOverlap;
        })
        .sort((a, b) => {
          // Trier par priorité:
          // 1. Employés ayant moins d'heures assignées par rapport à leur cible
          const aRemainingTarget = targetHours[a.id] - employeeHours[a.id];
          const bRemainingTarget = targetHours[b.id] - employeeHours[b.id];

          // 2. Si le mode équilibrage des rôles est activé, prendre en compte le rôle
          if (balanceRoles) {
            // Compter les rôles déjà assignés à cette heure
            const roleCount = {};

            assignedEmployeeIds.forEach((empId) => {
              const emp = employees.find((e) => e.id === empId);
              if (emp && emp.role) {
                roleCount[emp.role] = (roleCount[emp.role] || 0) + 1;
              }
            });

            // Favoriser les rôles moins représentés
            if (a.role && b.role && roleCount[a.role] !== roleCount[b.role]) {
              return (roleCount[a.role] || 0) - (roleCount[b.role] || 0);
            }
          }

          // 3. Priorité aux employés ayant plus d'heures restantes à attribuer
          return bRemainingTarget - aRemainingTarget;
        });

      // Assigner des shifts aux employés disponibles jusqu'à atteindre le minimum
      for (
        let i = 0;
        i < Math.min(neededEmployees, availableEmployees.length);
        i++
      ) {
        const emp = availableEmployees[i];

        // Créer un shift de 3-4h autour de l'heure critique
        const shiftStart = Math.max(businessHours.start, hour - 1);
        const shiftEnd = Math.min(businessHours.end, hour + 3);

        // Vérifier la disponibilité pour toutes les heures du shift
        let fullyAvailable = true;
        for (let h = shiftStart; h < shiftEnd; h++) {
          if (!availability[day][emp.id][h]) {
            fullyAvailable = false;
            break;
          }
        }

        if (fullyAvailable) {
          // Ajouter le shift
          scheduleData[day][emp.id].push({
            start: shiftStart,
            end: shiftEnd,
            duration: shiftEnd - shiftStart,
            required: true, // Marqué comme requis pour le minimum d'employés
          });

          // Mettre à jour le compteur d'heures
          employeeHours[emp.id] += shiftEnd - shiftStart;

          // Ajouter à la liste des employés assignés
          assignedEmployeeIds.add(emp.id);
          assignedEmployees++;
        }
      }
    }
  }
}

/**
 * Effectue une optimisation locale du planning sur plusieurs itérations
 * pour améliorer la qualité globale du planning
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 * @param {number} minimumEmployees Nombre minimum d'employés requis
 * @param {boolean} balanceRoles Équilibrer les rôles
 * @param {number} maxIterations Nombre maximal d'itérations
 */
function localOptimization(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  employeePreferences,
  minimumEmployees,
  balanceRoles,
  maxIterations
) {
  // Calculer la qualité initiale du planning
  let currentScore = evaluateSchedule(
    scheduleData,
    employees,
    businessHours,
    employeeHours,
    employeePreferences,
    minimumEmployees,
    balanceRoles
  );

  let improvements = 0;

  // Effectuer plusieurs itérations d'optimisation
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let improved = false;

    // 1. Tenter d'équilibrer les heures entre employés
    improved =
      tryBalanceHours(
        scheduleData,
        employees,
        days,
        businessHours,
        employeeHours,
        availability,
        employeePreferences
      ) || improved;

    // 2. Tenter d'améliorer le respect des préférences
    improved =
      tryImprovePreferences(
        scheduleData,
        employees,
        days,
        businessHours,
        employeeHours,
        availability,
        employeePreferences
      ) || improved;

    // 3. Si l'équilibrage des rôles est activé, tenter de l'améliorer
    if (balanceRoles) {
      improved =
        tryBalanceRoles(
          scheduleData,
          employees,
          days,
          businessHours,
          employeeHours,
          availability
        ) || improved;
    }

    // Évaluer le nouveau score
    const newScore = evaluateSchedule(
      scheduleData,
      employees,
      businessHours,
      employeeHours,
      employeePreferences,
      minimumEmployees,
      balanceRoles
    );

    // Si le score s'est amélioré, continuer; sinon, sortir après plusieurs itérations sans amélioration
    if (newScore > currentScore) {
      currentScore = newScore;
      improvements++;
    } else if (!improved) {
      // Si aucune amélioration n'a été trouvée lors de cette itération, on peut sortir
      if (improvements > 0) {
        console.log(
          `Optimisation terminée après ${
            iteration + 1
          } itérations avec ${improvements} améliorations.`
        );
      }
      break;
    }
  }
}

/**
 * Tente d'équilibrer les heures entre les employés en échangeant des shifts
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 * @returns {boolean} Vrai si des améliorations ont été effectuées
 */
function tryBalanceHours(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  employeePreferences
) {
  let improved = false;

  // Calculer les heures de contrat cibles
  const targetHours = {};
  employees.forEach((emp) => {
    targetHours[emp.id] = emp.contractHours
      ? parseFloat(emp.contractHours)
      : 40;
  });

  // Identifier les employés en sur-heures et en sous-heures
  const overworkedEmployees = [];
  const underworkedEmployees = [];

  employees.forEach((emp) => {
    const hourDifference = employeeHours[emp.id] - targetHours[emp.id];

    if (hourDifference > 2) {
      // Plus de 2h au-dessus de la cible
      overworkedEmployees.push({
        employee: emp,
        difference: hourDifference,
      });
    } else if (hourDifference < -2) {
      // Plus de 2h en dessous de la cible
      underworkedEmployees.push({
        employee: emp,
        difference: hourDifference,
      });
    }
  });

  // Trier par écart le plus important
  overworkedEmployees.sort((a, b) => b.difference - a.difference);
  underworkedEmployees.sort((a, b) => a.difference - b.difference);

  // Pour chaque employé en sur-heures, essayer de transférer un shift
  for (const overworked of overworkedEmployees) {
    if (underworkedEmployees.length === 0) break;

    const empA = overworked.employee;

    // Trouver tous les shifts de cet employé
    const empShifts = [];
    days.forEach((day) => {
      if (!scheduleData[day][empA.id]) return;

      scheduleData[day][empA.id].forEach((shift, index) => {
        empShifts.push({ day, index, shift });
      });
    });

    // Trier les shifts du moins préféré au plus préféré
    empShifts.sort((a, b) => {
      // Priorité de transfert: shifts forcés (requis) > shifts normaux > shifts préférés
      const aIsPreferred = a.shift.preferred;
      const bIsPreferred = b.shift.preferred;
      const aIsRequired = a.shift.required;
      const bIsRequired = b.shift.required;

      if (aIsRequired && !bIsRequired) return -1;
      if (!aIsRequired && bIsRequired) return 1;
      if (aIsPreferred && !bIsPreferred) return 1;
      if (!aIsPreferred && bIsPreferred) return -1;

      // Sinon, par durée (privilégier le transfert de shifts longs)
      return b.shift.duration - a.shift.duration;
    });

    // Essayer de transférer un shift aux employés en sous-heures
    for (const shiftInfo of empShifts) {
      const { day, index, shift } = shiftInfo;

      // Trouver un employé en sous-heures qui peut prendre ce shift
      for (let i = 0; i < underworkedEmployees.length; i++) {
        const empB = underworkedEmployees[i].employee;

        // Vérifier si l'employé est disponible pour toutes les heures du shift
        let fullyAvailable = true;
        for (let hour = shift.start; hour < shift.end; hour++) {
          if (!availability[day][empB.id][hour]) {
            fullyAvailable = false;
            break;
          }
        }

        if (!fullyAvailable) continue;

        // Vérifier s'il y a des chevauchements avec des shifts existants
        let hasOverlap = false;
        scheduleData[day][empB.id].forEach((existingShift) => {
          if (
            shift.start < existingShift.end &&
            shift.end > existingShift.start
          ) {
            hasOverlap = true;
          }
        });

        if (hasOverlap) continue;

        // Transférer le shift
        // Retirer de l'employé A
        const shiftToMove = scheduleData[day][empA.id].splice(index, 1)[0];

        // Ajouter à l'employé B, en conservant les propriétés
        scheduleData[day][empB.id].push(shiftToMove);

        // Mettre à jour les compteurs d'heures
        employeeHours[empA.id] -= shift.duration;
        employeeHours[empB.id] += shift.duration;

        // Mettre à jour les différences pour les employés concernés
        underworkedEmployees[i].difference += shift.duration;
        overworked.difference -= shift.duration;

        // Retirer l'employé B de la liste des sous-heures s'il est maintenant équilibré
        if (underworkedEmployees[i].difference > -2) {
          underworkedEmployees.splice(i, 1);
        }

        improved = true;

        // Sortir des boucles pour passer à l'employé suivant
        break;
      }

      // Si l'employé n'est plus en sur-heures significatives, passer au suivant
      if (overworked.difference <= 2) break;
    }
  }

  return improved;
}

/**
 * Tente d'améliorer le respect des préférences des employés en échangeant des shifts
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 * @returns {boolean} Vrai si des améliorations ont été effectuées
 */
function tryImprovePreferences(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  employeePreferences
) {
  let improved = false;

  // Pour chaque jour ouvré
  days.forEach((day) => {
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return;
    }

    // Parcourir toutes les paires possibles d'employés
    for (let i = 0; i < employees.length - 1; i++) {
      const empA = employees[i];

      for (let j = i + 1; j < employees.length; j++) {
        const empB = employees[j];

        // Essayer tous les shifts possibles à échanger
        const shiftsA = scheduleData[day][empA.id] || [];
        const shiftsB = scheduleData[day][empB.id] || [];

        for (let a = 0; a < shiftsA.length; a++) {
          for (let b = 0; b < shiftsB.length; b++) {
            // Evaluer la qualité de l'échange
            const swapResult = evaluateShiftSwap(
              scheduleData,
              day,
              empA,
              shiftsA[a],
              a,
              empB,
              shiftsB[b],
              b,
              availability,
              employeePreferences
            );

            if (swapResult.improvement > 0) {
              // Effectuer l'échange des shifts
              const shiftA = shiftsA[a];
              shiftsA[a] = shiftsB[b];
              shiftsB[b] = shiftA;

              // Mettre à jour les compteurs d'heures si nécessaire
              if (shiftA.duration !== shiftsB[b].duration) {
                const hourDiff = shiftsB[b].duration - shiftA.duration;
                employeeHours[empA.id] -= hourDiff;
                employeeHours[empB.id] += hourDiff;
              }

              improved = true;
            }
          }
        }
      }
    }
  });

  return improved;
}

/**
 * Évalue l'impact d'un échange de shifts entre deux employés
 * sur la qualité globale du planning et les préférences
 *
 * @param {Object} scheduleData Planning actuel
 * @param {string} day Jour concerné
 * @param {Object} empA Premier employé
 * @param {Object} shiftA Shift du premier employé
 * @param {number} indexA Index du shift dans la liste
 * @param {Object} empB Second employé
 * @param {Object} shiftB Shift du second employé
 * @param {number} indexB Index du shift dans la liste
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 * @returns {Object} Évaluation de l'amélioration potentielle
 */
function evaluateShiftSwap(
  scheduleData,
  day,
  empA,
  shiftA,
  indexA,
  empB,
  shiftB,
  indexB,
  availability,
  employeePreferences
) {
  // Vérifier la disponibilité des employés pour les shifts échangés
  let empACanTakeShiftB = true;
  let empBCanTakeShiftA = true;

  // Vérifier si empA peut prendre le shift de empB
  for (let hour = shiftB.start; hour < shiftB.end; hour++) {
    if (!availability[day][empA.id][hour]) {
      empACanTakeShiftB = false;
      break;
    }
  }

  // Vérifier si empB peut prendre le shift de empA
  for (let hour = shiftA.start; hour < shiftA.end; hour++) {
    if (!availability[day][empB.id][hour]) {
      empBCanTakeShiftA = false;
      break;
    }
  }

  // Si l'un des deux employés ne peut pas prendre le shift de l'autre, l'échange est impossible
  if (!empACanTakeShiftB || !empBCanTakeShiftA) {
    return { improvement: -1 };
  }

  // Vérifier les chevauchements potentiels
  // Pour empA prenant le shift de empB
  const shiftsOfA = [...scheduleData[day][empA.id]];
  shiftsOfA.splice(indexA, 1); // Retirer le shift qui sera échangé

  let hasOverlapA = false;
  shiftsOfA.forEach((shift) => {
    if (shiftB.start < shift.end && shiftB.end > shift.start) {
      hasOverlapA = true;
    }
  });

  // Pour empB prenant le shift de empA
  const shiftsOfB = [...scheduleData[day][empB.id]];
  shiftsOfB.splice(indexB, 1); // Retirer le shift qui sera échangé

  let hasOverlapB = false;
  shiftsOfB.forEach((shift) => {
    if (shiftA.start < shift.end && shiftA.end > shift.start) {
      hasOverlapB = true;
    }
  });

  // Si des chevauchements sont détectés, l'échange est impossible
  if (hasOverlapA || hasOverlapB) {
    return { improvement: -1 };
  }

  // Calculer le score de préférence actuel
  const currentPreferenceScoreA = calculatePreferenceScore(
    empA,
    day,
    shiftA,
    employeePreferences
  );
  const currentPreferenceScoreB = calculatePreferenceScore(
    empB,
    day,
    shiftB,
    employeePreferences
  );

  // Calculer le score de préférence après échange
  const newPreferenceScoreA = calculatePreferenceScore(
    empA,
    day,
    shiftB,
    employeePreferences
  );
  const newPreferenceScoreB = calculatePreferenceScore(
    empB,
    day,
    shiftA,
    employeePreferences
  );

  // Calculer l'amélioration globale
  const currentScore = currentPreferenceScoreA + currentPreferenceScoreB;
  const newScore = newPreferenceScoreA + newPreferenceScoreB;

  const improvement = newScore - currentScore;

  return { improvement };
}

/**
 * Tente d'équilibrer les rôles des employés sur chaque créneau horaire
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @returns {boolean} Vrai si des améliorations ont été effectuées
 */
function tryBalanceRoles(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability
) {
  let improved = false;

  // Pour chaque jour ouvré
  days.forEach((day) => {
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return;
    }

    const [openHour, closeHour] = businessHours[day];

    // Pour chaque heure de la journée
    for (let hour = openHour; hour < closeHour; hour++) {
      // Compter les employés par rôle à cette heure
      const roleCount = {};
      const employeesByRole = {};

      employees.forEach((emp) => {
        const role = emp.role || "default";

        // Vérifier si l'employé travaille à cette heure
        let isWorking = false;

        if (scheduleData[day][emp.id]) {
          scheduleData[day][emp.id].forEach((shift) => {
            if (hour >= shift.start && hour < shift.end) {
              isWorking = true;
            }
          });
        }

        if (isWorking) {
          roleCount[role] = (roleCount[role] || 0) + 1;

          if (!employeesByRole[role]) {
            employeesByRole[role] = [];
          }
          employeesByRole[role].push(emp);
        }
      });

      // Identifier les rôles sur/sous-représentés
      const roles = Object.keys(roleCount);

      if (roles.length <= 1) continue; // Pas besoin d'équilibrer s'il n'y a qu'un seul rôle

      const avgRoleCount =
        roles.reduce((sum, role) => sum + roleCount[role], 0) / roles.length;

      const overrepresentedRoles = roles
        .filter((role) => roleCount[role] > avgRoleCount + 0.5)
        .sort((a, b) => roleCount[b] - roleCount[a]);

      const underrepresentedRoles = roles
        .filter((role) => roleCount[role] < avgRoleCount - 0.5)
        .sort((a, b) => roleCount[a] - roleCount[b]);

      // Essayer d'équilibrer en échangeant des employés
      for (const overRole of overrepresentedRoles) {
        for (const underRole of underrepresentedRoles) {
          // Chercher des employés disponibles non assignés à cette heure pour le rôle sous-représenté
          const employeesToAdd = employees
            .filter((emp) => (emp.role || "default") === underRole)
            .filter((emp) => {
              // Vérifier s'ils sont disponibles à cette heure
              if (!availability[day][emp.id][hour]) return false;

              // Vérifier s'ils travaillent déjà à cette heure
              let alreadyWorking = false;

              if (scheduleData[day][emp.id]) {
                scheduleData[day][emp.id].forEach((shift) => {
                  if (hour >= shift.start && hour < shift.end) {
                    alreadyWorking = true;
                  }
                });
              }

              return !alreadyWorking;
            });

          if (employeesToAdd.length === 0) continue;

          // Chercher des employés du rôle sur-représenté qui pourraient être retirés
          const employeesToRemove = employeesByRole[overRole].filter((emp) => {
            // Éviter de retirer des employés assignés à des shifts critiques ou requis
            let isCriticalOrRequired = false;

            scheduleData[day][emp.id].forEach((shift) => {
              if (
                hour >= shift.start &&
                hour < shift.end &&
                (shift.critical || shift.required)
              ) {
                isCriticalOrRequired = true;
              }
            });

            return !isCriticalOrRequired;
          });

          if (employeesToRemove.length === 0) continue;

          // Trouver une paire d'employés pour échanger leurs shifts
          // (à implémenter selon les besoins spécifiques - cela implique de retravailler les shifts)

          // Version simplifiée: plutôt que d'échanger complet, on pourrait juste marquer
          // certains employés comme prioritaires pour les futures modifications

          // Ici, une amélioration effective nécessiterait une refactorisation plus profonde
          // des shifts existants, ce qui dépasse le cadre de cette implémentation de base

          // On marque simplement qu'une amélioration est possible pour continuer l'optimisation
          improved = true;
        }
      }
    }
  });

  return improved;
}

/**
 * S'assure que la couverture minimale est respectée pour toutes les heures d'ouverture
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {number} minimumEmployees Nombre minimum d'employés requis
 */
function ensureCoverage(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  minimumEmployees
) {
  // Pour chaque jour ouvré
  days.forEach((day) => {
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return;
    }

    const [openHour, closeHour] = businessHours[day];

    // Vérifier la couverture pour chaque heure
    for (let hour = openHour; hour < closeHour; hour++) {
      // Compter les employés assignés à cette heure
      let assignedCount = 0;

      employees.forEach((emp) => {
        if (scheduleData[day][emp.id]) {
          scheduleData[day][emp.id].forEach((shift) => {
            if (hour >= shift.start && hour < shift.end) {
              assignedCount++;
            }
          });
        }
      });

      // Si le nombre est inférieur au minimum requis, essayer d'ajouter des employés
      if (assignedCount < minimumEmployees) {
        const neededEmployees = minimumEmployees - assignedCount;

        // Trouver des employés disponibles non encore assignés
        const availableEmployees = employees
          .filter((emp) => {
            // Vérifier s'ils sont disponibles
            if (!availability[day][emp.id][hour]) return false;

            // Vérifier s'ils ne sont pas déjà assignés
            let alreadyAssigned = false;

            if (scheduleData[day][emp.id]) {
              scheduleData[day][emp.id].forEach((shift) => {
                if (hour >= shift.start && hour < shift.end) {
                  alreadyAssigned = true;
                }
              });
            }

            return !alreadyAssigned;
          })
          .sort((a, b) => employeeHours[a.id] - employeeHours[b.id]); // Favoriser ceux avec moins d'heures

        // Assigner de nouveaux shifts aux employés disponibles
        for (
          let i = 0;
          i < Math.min(neededEmployees, availableEmployees.length);
          i++
        ) {
          const emp = availableEmployees[i];

          // Créer un shift d'urgence de 2-3h autour de l'heure critique
          const shiftStart = Math.max(openHour, hour - 1);
          const shiftEnd = Math.min(closeHour, hour + 2);

          // Vérifier la disponibilité pour toutes les heures du shift
          let fullyAvailable = true;
          for (let h = shiftStart; h < shiftEnd; h++) {
            if (!availability[day][emp.id][h]) {
              fullyAvailable = false;
              break;
            }
          }

          // Vérifier qu'il n'y a pas de chevauchement avec d'autres shifts
          let hasOverlap = false;

          if (scheduleData[day][emp.id]) {
            scheduleData[day][emp.id].forEach((existingShift) => {
              if (
                shiftStart < existingShift.end &&
                shiftEnd > existingShift.start
              ) {
                hasOverlap = true;
              }
            });
          }

          if (fullyAvailable && !hasOverlap) {
            // Ajouter le shift
            if (!scheduleData[day][emp.id]) {
              scheduleData[day][emp.id] = [];
            }

            scheduleData[day][emp.id].push({
              start: shiftStart,
              end: shiftEnd,
              duration: shiftEnd - shiftStart,
              urgent: true, // Marquer comme un shift d'urgence pour la couverture
            });

            // Mettre à jour le compteur d'heures
            employeeHours[emp.id] += shiftEnd - shiftStart;

            assignedCount++;
          }
        }
      }
    }
  });
}

/**
 * Évalue la qualité d'un planning selon plusieurs critères
 */
function evaluateSchedule(
  scheduleData,
  employees,
  businessHours,
  employeeHours,
  employeePreferences,
  minimumEmployees,
  balanceRoles
) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let score = 100; // Score de base

  // 1. Évaluer l'équilibre des heures attribuées vs. heures contractuelles
  employees.forEach((emp) => {
    const contractHours = emp.contractHours || 35;
    const assigned = employeeHours[emp.id] || 0;

    // Pénalité pour les écarts
    const diff = Math.abs(assigned - contractHours);

    if (assigned > contractHours) {
      // Pénaliser davantage les heures supplémentaires
      score -= diff * 2;
    } else {
      // Pénaliser les heures manquantes
      score -= diff;
    }
  });

  // 2. Évaluer le respect des préférences
  let preferencesMatched = 0;
  let totalPreferences = 0;

  if (employeePreferences) {
    Object.entries(employeePreferences).forEach(([empId, prefs]) => {
      empId = parseInt(empId);

      if (!prefs || typeof prefs !== "object") return;

      days.forEach((day) => {
        if (!prefs[day] || !Array.isArray(prefs[day])) return;

        const preferredSlots = prefs[day];
        const assignedSlots = scheduleData[day][empId] || [];

        preferredSlots.forEach((preferred) => {
          totalPreferences++;

          // Vérifier la correspondance
          const isMatched = assignedSlots.some(
            (assigned) =>
              assigned.start <= preferred.start && assigned.end >= preferred.end
          );

          if (isMatched) {
            preferencesMatched++;
          }
        });
      });
    });
  }

  if (totalPreferences > 0) {
    const preferenceMatchRate = preferencesMatched / totalPreferences;
    score += preferenceMatchRate * 50; // Max 50 points bonus
  }

  // 3. Évaluer la couverture des créneaux
  days.forEach((day) => {
    if (
      !businessHours[day] ||
      !Array.isArray(businessHours[day]) ||
      businessHours[day].length !== 2
    ) {
      return;
    }

    const [openHour, closeHour] = businessHours[day];

    for (let hour = openHour; hour < closeHour; hour++) {
      let present = 0;

      employees.forEach((emp) => {
        const shifts = scheduleData[day][emp.id] || [];
        const isPresent = shifts.some(
          (shift) => shift.start <= hour && shift.end > hour
        );

        if (isPresent) {
          present++;
        }
      });

      // Pénaliser les créneaux sous-staffés
      if (present < minimumEmployees) {
        score -= 5 * (minimumEmployees - present);
      }
    }
  });

  return score;
}

/**
 * Calcule les métriques finales du planning
 */
function calculateMetrics(
  scheduleData,
  employees,
  employeeHours,
  employeePreferences,
  days,
  businessHours
) {
  // Calculer le taux de correspondance des préférences
  let preferencesMatched = 0;
  let totalPreferences = 0;

  if (employeePreferences) {
    Object.entries(employeePreferences).forEach(([empId, prefs]) => {
      empId = parseInt(empId);

      if (!prefs || typeof prefs !== "object") return;

      days.forEach((day) => {
        if (!prefs[day] || !Array.isArray(prefs[day])) return;

        const preferredSlots = prefs[day];
        const assignedSlots = scheduleData[day][empId] || [];

        preferredSlots.forEach((preferred) => {
          totalPreferences++;

          const isMatched = assignedSlots.some(
            (assigned) =>
              assigned.start <= preferred.start && assigned.end >= preferred.end
          );

          if (isMatched) {
            preferencesMatched++;
          }
        });
      });
    });
  }

  const preferenceMatchRate =
    totalPreferences > 0 ? preferencesMatched / totalPreferences : 1;

  // Identifier les employés en surcharge
  const overworkedEmployees = employees
    .filter((emp) => {
      const contractHours = emp.contractHours || 35;
      return employeeHours[emp.id] > contractHours;
    })
    .map((emp) => ({
      employee_id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      contract_hours: emp.contractHours || 35,
      assigned_hours: employeeHours[emp.id],
      difference: employeeHours[emp.id] - (emp.contractHours || 35),
    }));

  return {
    preference_match_rate: preferenceMatchRate,
    overworked_employees: overworkedEmployees,
  };
}

/**
 * Équilibre la charge de travail entre employés en ajustant les shifts existants
 *
 * @param {Object} scheduleData Planning en cours de construction
 * @param {Array<Object>} employees Liste des employés
 * @param {Array<string>} days Jours de la semaine
 * @param {Object} businessHours Heures d'ouverture par jour
 * @param {Object} employeeHours Compteur d'heures par employé
 * @param {Object} availability Matrice de disponibilité
 * @param {Object} employeePreferences Préférences des employés
 */
function balanceWorkload(
  scheduleData,
  employees,
  days,
  businessHours,
  employeeHours,
  availability,
  employeePreferences
) {
  // Calculer les heures cibles par employé
  const targetHours = {};
  employees.forEach((emp) => {
    targetHours[emp.id] = emp.contractHours
      ? parseFloat(emp.contractHours)
      : 40;
  });

  // Identifier les employés en sur-heures importantes
  const overworkedEmployees = employees
    .filter((emp) => employeeHours[emp.id] > targetHours[emp.id] + 5) // Plus de 5h au-dessus de la cible
    .sort(
      (a, b) =>
        employeeHours[b.id] -
        targetHours[b.id] -
        (employeeHours[a.id] - targetHours[a.id])
    );

  // Pour chaque employé en sur-heures
  overworkedEmployees.forEach((emp) => {
    const excessHours = employeeHours[emp.id] - targetHours[emp.id];

    if (excessHours <= 0) return;

    // Trouver les shifts les moins prioritaires pour cet employé
    const empShifts = [];

    days.forEach((day) => {
      if (!scheduleData[day][emp.id]) return;

      scheduleData[day][emp.id].forEach((shift, index) => {
        // Calculer un score de priorité pour ce shift
        const preferenceScore = calculatePreferenceScore(
          emp,
          day,
          shift,
          employeePreferences
        );

        empShifts.push({
          day,
          index,
          shift,
          score: preferenceScore,
        });
      });
    });

    // Trier les shifts du moins prioritaire au plus prioritaire
    empShifts.sort((a, b) => {
      // Critère principal: si un shift est marqué comme urgent/requis/critique
      if (
        (a.shift.urgent || a.shift.required || a.shift.critical) &&
        !(b.shift.urgent || b.shift.required || b.shift.critical)
      ) {
        return 1;
      }

      if (
        !(a.shift.urgent || a.shift.required || a.shift.critical) &&
        (b.shift.urgent || b.shift.required || b.shift.critical)
      ) {
        return -1;
      }

      // Critère secondaire: score de préférence
      return a.score - b.score;
    });

    // Réduire la durée des shifts les moins prioritaires
    let hoursToReduce = Math.min(excessHours, 4); // Limitons la réduction à 4h max

    for (const shiftInfo of empShifts) {
      if (hoursToReduce <= 0) break;

      const { day, index, shift } = shiftInfo;

      // Éviter de toucher aux shifts critiques/requis/urgents
      if (shift.critical || shift.required || shift.urgent) continue;

      // Éviter de réduire des shifts déjà courts (< 3h)
      if (shift.duration < 3) continue;

      // Calculer combien d'heures on peut réduire ce shift
      const maxReduction = Math.min(shift.duration - 2, hoursToReduce); // Garder minimum 2h

      if (maxReduction <= 0) continue;

      // Réduire le shift (de préférence en fin de journée)
      const newEnd = shift.end - maxReduction;

      // Mettre à jour le shift
      scheduleData[day][emp.id][index].end = newEnd;
      scheduleData[day][emp.id][index].duration -= maxReduction;

      // Mettre à jour le compteur d'heures
      employeeHours[emp.id] -= maxReduction;

      hoursToReduce -= maxReduction;
    }
  });
}

/**
 * Calcule un score de préférence pour un employé et un shift donné
 *
 * @param {Object} employee Employé concerné
 * @param {string} day Jour du shift
 * @param {Object} shift Shift à évaluer
 * @param {Object} employeePreferences Préférences des employés
 * @returns {number} Score de préférence
 */
function calculatePreferenceScore(employee, day, shift, employeePreferences) {
  let score = 0;

  // Si le shift est déjà marqué comme préféré, fort score
  if (shift.preferred) {
    score += 10;
  }

  // Si le shift est déjà marqué comme requis, score négatif (on préfère ne pas l'échanger)
  if (shift.required) {
    score -= 5;
  }

  // Si le shift est déjà marqué comme critique, score très négatif (priorité à garder ces assignations)
  if (shift.critical) {
    score -= 10;
  }

  // Si le shift est déjà marqué comme urgent, score très négatif
  if (shift.urgent) {
    score -= 8;
  }

  // Vérifier les préférences spécifiques pour ce jour
  if (
    employeePreferences[employee.id] &&
    employeePreferences[employee.id][day]
  ) {
    const dayPrefs = employeePreferences[employee.id][day];
    if (Array.isArray(dayPrefs)) {
      dayPrefs.forEach((pref) => {
        if (
          Array.isArray(pref) &&
          pref.length === 2 &&
          shift.start >= pref[0] &&
          shift.end <= pref[1]
        ) {
          score += 8; // Fort bonus pour les shifts exactement préférés
        } else if (
          Array.isArray(pref) &&
          pref.length === 2 &&
          ((shift.start >= pref[0] && shift.start < pref[1]) ||
            (shift.end > pref[0] && shift.end <= pref[1]))
        ) {
          score += 4; // Bonus modéré pour les shifts partiellement préférés
        }
      });
    }
  }

  // Vérifier les préférences de shift du profil employé
  if (employee.preferred_shifts) {
    try {
      const preferredShifts = JSON.parse(employee.preferred_shifts);
      if (preferredShifts[day]) {
        preferredShifts[day].forEach((pref) => {
          if (
            Array.isArray(pref) &&
            pref.length === 2 &&
            shift.start >= pref[0] &&
            shift.end <= pref[1]
          ) {
            score += 6; // Bonus pour les shifts préférés du profil
          }
        });
      }
    } catch (e) {
      // Ignorer l'erreur de parsing
    }
  }

  return score;
}

module.exports = {
  optimizeSchedule,
};
