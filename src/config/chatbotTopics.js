/**
 * Configuration des sujets et questions préconfigurées pour le chatbot
 */

// Suppression des icônes Material UI pour éviter les problèmes de rendu
export const CHATBOT_TOPICS = [
  {
    id: "donnees",
    name: "Données personnalisées",
    description: "Questions sur les données actuelles de l'application",
    questions: [
      {
        id: "donnees_1",
        text: "Qui ne travaille pas aujourd'hui ?",
        action: "get_absences_today",
        dynamicResponse: true,
      },
      {
        id: "donnees_2",
        text: "Qui travaille aujourd'hui ?",
        action: "get_working_today",
        dynamicResponse: true,
      },
      {
        id: "donnees_3",
        text: "Quelles sont les horaires des employés aujourd'hui ?",
        action: "get_employee_hours_today",
        dynamicResponse: true,
      },
      {
        id: "donnees_4",
        text: "Qui sont les prochaines personnes en congés ?",
        action: "get_upcoming_vacations",
        dynamicResponse: true,
      },
      {
        id: "donnees_5",
        text: "Qui a son solde d'heures positif ?",
        action: "get_positive_hours",
        dynamicResponse: true,
      },
      {
        id: "donnees_6",
        text: "Qui a son solde d'heures négatif ?",
        action: "get_negative_hours",
        dynamicResponse: true,
      },
      {
        id: "donnees_7",
        text: "Manque-t-il des plannings à faire pour la semaine prochaine ?",
        action: "get_missing_schedules",
        dynamicResponse: true,
      },
    ],
  },
  {
    id: "aide",
    name: "Aide utilisation",
    description: "Apprenez à utiliser l'application",
    questions: [
      {
        id: "aide_1",
        text: "Comment modifier mon profil ?",
        response:
          "Pour modifier votre profil, cliquez sur votre avatar en haut à droite, puis sur 'Paramètres du compte'. Vous pourrez alors modifier vos informations personnelles, votre mot de passe et vos préférences de notification.",
      },
      {
        id: "aide_2",
        text: "Comment contacter le support ?",
        response:
          "Pour contacter notre équipe de support, rendez-vous dans la section 'Aide' accessible depuis le menu principal, puis cliquez sur 'Contacter le support'. Vous pouvez également envoyer un email directement à support@smartplanning.com",
      },
      {
        id: "aide_3",
        text: "Comment naviguer dans l'application ?",
        response:
          "L'application est divisée en plusieurs sections accessibles depuis le menu latéral : Planning, Congés, Équipe, Statistiques et Paramètres. Cliquez sur l'icône du menu (☰) pour afficher ou masquer ce menu sur mobile.",
      },
      {
        id: "aide_4",
        text: "Comment changer la langue ?",
        response:
          "Pour changer la langue de l'application, accédez à vos 'Paramètres du compte' depuis le menu utilisateur en haut à droite, puis allez dans l'onglet 'Préférences' et sélectionnez la langue de votre choix dans le menu déroulant.",
      },
    ],
  },
  {
    id: "employes",
    name: "Employés",
    description: "Informations sur les employés",
    questions: [
      {
        id: "employes_1",
        text: "Comment ajouter un nouvel employé ?",
        response:
          "Pour ajouter un nouvel employé, rendez-vous dans la section 'Équipe', puis cliquez sur le bouton '+ Ajouter un employé'. Remplissez le formulaire avec les informations requises, puis validez. Le nouvel employé recevra un email d'invitation pour créer son compte.",
      },
      {
        id: "employes_2",
        text: "Comment modifier les droits d'un employé ?",
        response:
          "Pour modifier les droits d'un employé, accédez à la section 'Équipe', cliquez sur l'employé concerné, puis sur 'Gérer les accès'. Vous pourrez alors ajuster ses permissions selon son rôle dans l'entreprise. Seuls les administrateurs peuvent effectuer cette action.",
      },
      {
        id: "employes_3",
        text: "Comment voir les disponibilités des employés ?",
        response:
          "Pour voir les disponibilités des employés, rendez-vous dans la section 'Planning', puis cliquez sur 'Vue disponibilités'. Vous verrez un tableau récapitulatif des disponibilités de chaque employé sur la période sélectionnée.",
      },
      {
        id: "employes_4",
        text: "Comment gérer les départements ?",
        response:
          "Pour gérer les départements, accédez à la section 'Équipe', puis cliquez sur l'onglet 'Départements'. Vous pourrez créer, modifier ou supprimer des départements, ainsi qu'affecter des employés à chaque département.",
      },
    ],
  },
  {
    id: "plannings",
    name: "Plannings",
    description: "Gestion des plannings",
    questions: [
      {
        id: "plannings_1",
        text: "Comment créer un planning ?",
        response:
          "Pour créer un planning, accédez à la section 'Planning', puis cliquez sur '+ Nouveau planning'. Sélectionnez la période concernée, les employés à inclure et les horaires d'ouverture. Vous pouvez ensuite générer automatiquement un planning ou le créer manuellement.",
      },
      {
        id: "plannings_2",
        text: "Comment modifier un horaire ?",
        response:
          "Pour modifier un horaire dans le planning, cliquez sur le créneau concerné dans la vue planning. Un menu contextuel s'ouvrira, vous permettant de modifier l'heure de début, l'heure de fin, ou de réaffecter ce créneau à un autre employé.",
      },
      {
        id: "plannings_3",
        text: "Comment copier un planning d'une semaine à l'autre ?",
        response:
          "Pour copier un planning, ouvrez le planning source, cliquez sur 'Options' puis 'Copier vers...'. Sélectionnez ensuite la semaine de destination et les éléments à copier (horaires, affectations, notes). Cette fonction vous fait gagner beaucoup de temps pour les plannings récurrents.",
      },
      {
        id: "plannings_4",
        text: "Comment exporter un planning ?",
        response:
          "Pour exporter un planning, ouvrez-le puis cliquez sur 'Options' et 'Exporter'. Vous pourrez choisir le format d'export (PDF, Excel, iCal) et les données à inclure. Les employés peuvent également synchroniser leur planning avec leur calendrier personnel.",
      },
    ],
  },
  {
    id: "conges",
    name: "Congés",
    description: "Gestion des congés",
    questions: [
      {
        id: "conges_1",
        text: "Comment poser un congé ?",
        response:
          "Pour poser un congé, rendez-vous dans la section 'Congés', puis cliquez sur '+ Nouvelle demande'. Sélectionnez le type de congé, les dates de début et de fin, et ajoutez éventuellement un commentaire. Votre demande sera ensuite envoyée à votre responsable pour approbation.",
      },
      {
        id: "conges_2",
        text: "Comment consulter mon solde de congés ?",
        response:
          "Pour consulter votre solde de congés, accédez à la section 'Congés'. Votre solde actuel est affiché en haut de la page, avec le détail par type de congé (payés, RTT, etc.). Vous pouvez également consulter l'historique de vos congés et l'évolution de votre solde sur l'année.",
      },
      {
        id: "conges_3",
        text: "Comment valider les congés de mon équipe ?",
        response:
          "Pour valider les congés de votre équipe, accédez à la section 'Congés', puis à l'onglet 'Demandes en attente'. Vous verrez la liste des demandes à traiter. Cliquez sur une demande pour en voir les détails, puis sur 'Approuver' ou 'Refuser', en ajoutant éventuellement un commentaire.",
      },
      {
        id: "conges_4",
        text: "Comment modifier ou annuler un congé ?",
        response:
          "Pour modifier ou annuler un congé, rendez-vous dans la section 'Congés', trouvez la demande concernée dans la liste et cliquez dessus. Si la demande est encore en attente, vous pouvez la modifier ou la supprimer. Si elle est déjà approuvée, vous devrez créer une demande d'annulation qui devra être validée par votre responsable.",
      },
    ],
  },
  {
    id: "activites",
    name: "Activités",
    description: "Suivi des activités",
    questions: [
      {
        id: "activites_1",
        text: "Comment saisir mes heures d'activité ?",
        response:
          "Pour saisir vos heures d'activité, accédez à la section 'Activités', puis cliquez sur 'Saisie des heures'. Sélectionnez la date concernée, le projet et l'activité, puis indiquez le temps passé et ajoutez éventuellement un commentaire pour décrire votre travail.",
      },
      {
        id: "activites_2",
        text: "Comment suivre l'avancement d'un projet ?",
        response:
          "Pour suivre l'avancement d'un projet, rendez-vous dans la section 'Activités', puis sélectionnez le projet concerné dans la liste. Vous verrez un tableau de bord avec le temps passé, le budget consommé, les jalons atteints et les tâches restantes. Vous pouvez également générer des rapports d'avancement.",
      },
      {
        id: "activites_3",
        text: "Comment affecter des tâches à mon équipe ?",
        response:
          "Pour affecter des tâches à votre équipe, accédez à la section 'Activités', puis cliquez sur 'Gestion des tâches'. Créez une nouvelle tâche en indiquant son titre, sa description, sa date d'échéance et son priorité, puis assignez-la à un ou plusieurs membres de votre équipe.",
      },
      {
        id: "activites_4",
        text: "Comment générer un rapport d'activité ?",
        response:
          "Pour générer un rapport d'activité, rendez-vous dans la section 'Activités', puis cliquez sur 'Rapports'. Sélectionnez la période, les employés et les projets à inclure, puis choisissez le format du rapport (détaillé ou synthétique). Vous pouvez ensuite exporter le rapport en PDF ou Excel.",
      },
    ],
  },
  {
    id: "statistiques",
    name: "Statistiques",
    description: "Analyse des données",
    questions: [
      {
        id: "stats_1",
        text: "Comment analyser la charge de travail de mon équipe ?",
        response:
          "Pour analyser la charge de travail de votre équipe, rendez-vous dans la section 'Statistiques', puis cliquez sur 'Charge de travail'. Vous verrez un graphique montrant la répartition des heures travaillées par employé et par période. Vous pouvez filtrer par département, projet ou période pour affiner l'analyse.",
      },
      {
        id: "stats_2",
        text: "Comment suivre le taux d'absence ?",
        response:
          "Pour suivre le taux d'absence, accédez à la section 'Statistiques', puis à l'onglet 'Absences'. Vous verrez un tableau récapitulatif des absences par motif (congés, maladie, etc.) et par période. Vous pouvez également générer des graphiques d'évolution et comparer les données entre départements.",
      },
      {
        id: "stats_3",
        text: "Comment analyser la rentabilité des projets ?",
        response:
          "Pour analyser la rentabilité des projets, rendez-vous dans la section 'Statistiques', puis cliquez sur 'Analyse projets'. Pour chaque projet, vous verrez le budget prévisionnel, les coûts réels, le temps passé et la marge réalisée. Vous pouvez zoomer sur un projet spécifique pour une analyse plus détaillée.",
      },
      {
        id: "stats_4",
        text: "Comment exporter des statistiques ?",
        response:
          "Pour exporter des statistiques, ouvrez la vue statistique souhaitée, puis cliquez sur 'Exporter' en haut à droite. Vous pourrez choisir le format d'export (PDF, Excel, CSV) et les données à inclure. Ces exports peuvent être programmés pour être générés automatiquement à intervalle régulier et envoyés par email.",
      },
    ],
  },
];

/**
 * Trouve une question dans la liste des sujets par son ID
 * @param {string} questionId - L'ID de la question à trouver
 * @returns {Object|null} La question trouvée ou null
 */
export const findQuestionById = (questionId) => {
  for (const topic of CHATBOT_TOPICS) {
    const question = topic.questions.find((q) => q.id === questionId);
    if (question) return question;
  }
  return null;
};

/**
 * Trouve un sujet par son ID
 * @param {string} topicId - L'ID du sujet à trouver
 * @returns {Object|null} Le sujet trouvé ou null
 */
export const findTopicById = (topicId) => {
  return CHATBOT_TOPICS.find((topic) => topic.id === topicId) || null;
};

// Export par défaut pour compatibilité avec l'importation dans ChatbotRulesIntegration
export default CHATBOT_TOPICS;
