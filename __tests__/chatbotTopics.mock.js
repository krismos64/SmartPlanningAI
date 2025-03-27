/**
 * Configuration des sujets et questions préconfigurées pour le chatbot (version CommonJS pour tests)
 */

// Suppression des icônes Material UI pour éviter les problèmes de rendu
const CHATBOT_TOPICS = [
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
          "Pour modifier votre profil, cliquez sur votre avatar en haut à droite, puis sur 'Profil'. Vous pourrez alors modifier vos informations personnelles, votre mot de passe et vos préférences.",
      },
      {
        id: "aide_2",
        text: "Comment contacter le support ?",
        response:
          "Pour contacter notre équipe de support, rendez-vous dans la section 'Contact' accessible depuis le menu principal, puis remplissez le formulaire de contact. Vous pouvez également envoyer un email directement.",
      },
      {
        id: "aide_3",
        text: "Comment naviguer dans l'application ?",
        response:
          "L'application est divisée en plusieurs sections accessibles depuis le menu latéral : Planning, Congés, Liste des employés Statistiques et Paramètres. Cliquez sur l'icône du menu (☰) pour afficher ou masquer ce menu sur mobile.",
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
          "Pour ajouter un nouvel employé, rendez-vous dans la section 'Employés', puis cliquez sur le bouton 'Ajouter un employé'. Remplissez le formulaire avec les informations requises, puis validez.",
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
          "Pour créer un planning, accédez à la section 'Planning', puis cliquez sur 'Éditer' devant la ligne de l'employé concerné. Sélectionnez la période et les horaires à inclure. Vous pouvez ensuite générer automatiquement un planning ou le créer manuellement.",
      },
      {
        id: "plannings_2",
        text: "Comment modifier un horaire ?",
        response:
          "Pour modifier un horaire dans le planning, cliquez sur le créneau concerné dans la vue planning. Un menu contextuel s'ouvrira, vous permettant de modifier l'heure de début, l'heure de fin.",
      },
      {
        id: "plannings_4",
        text: "Comment exporter un planning ?",
        response:
          "Pour exporter un planning, cliquez sur 'PDF' sur la ligne de l'employé concerné. Si vous voulez un planning global ou par département, cliquez sur 'Options d'export'.",
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
          "Pour poser un congé, rendez-vous dans la section 'Congés', puis cliquez sur '+ Nouvelle demande'. Sélectionnez le type de congé, les dates de début et de fin, et ajoutez éventuellement un commentaire. Votre demande sera ensuite en attente d approbation.",
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
          "Pour modifier ou annuler un congé, rendez-vous dans la section 'Congés', trouvez la demande concernée dans la liste et cliquez dessus. Si la demande est encore en attente, vous pouvez la modifier ou la supprimer.",
      },
    ],
  },
];

/**
 * Trouve une question dans la liste des sujets par son ID
 * @param {string} questionId - L'ID de la question à trouver
 * @returns {Object|null} La question trouvée ou null
 */
const findQuestionById = (questionId) => {
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
const findTopicById = (topicId) => {
  return CHATBOT_TOPICS.find((topic) => topic.id === topicId) || null;
};

module.exports = {
  CHATBOT_TOPICS,
  findQuestionById,
  findTopicById,
  default: CHATBOT_TOPICS,
};
