# Chatbot basé sur des règles pour SmartPlanning

Ce document explique le fonctionnement du chatbot basé sur des règles qui remplace l'implémentation précédente utilisant l'API Mistral.

## Architecture

Le système comprend les composants suivants :

1. **Service de règles** (`chatbotRules.js`) : Définit les règles de correspondance basées sur des mots-clés et les réponses associées, avec des requêtes SQL directes à la base de données pour les informations dynamiques.

2. **Routes du chatbot** (`chatbotRoutes.js`) : Endpoints API pour traiter les messages utilisateur et fournir des réponses.

3. **Service client** (`ChatbotService.js`) : Gère les requêtes vers l'API et le traitement des réponses côté client.

4. **Intégration UI** (`ChatbotRulesIntegration.js`) : Composant qui intègre le service client avec l'interface utilisateur React.

## Comment fonctionne le système

1. **Détection par mots-clés** : Le système détecte les intentions utilisateur en recherchant des mots-clés dans le message. Exemple : "prochain congé" déclenche une recherche des congés à venir.

2. **Requêtes SQL directes** : Pour les informations dynamiques, le système exécute des requêtes SQL directement sur la base de données.

3. **Réponses statiques** : Pour les questions génériques (comme "Comment modifier mon planning ?"), le système utilise des réponses préconfigurées.

4. **Actions suggérées** : Après chaque réponse, le système peut proposer des actions pertinentes (boutons) que l'utilisateur peut cliquer.

## Types de règles

### Règles avec requête SQL

Ces règles incluent un gestionnaire (`handler`) qui exécute une requête SQL et formate la réponse en fonction des résultats. Exemples :

- **Prochain congé** : Recherche le prochain congé approuvé de l'utilisateur.
- **Solde de congés** : Récupère le solde de congés de l'employé.
- **Planning de la semaine** : Obtient les horaires de travail de la semaine en cours.
- **Absences d'équipe** : Trouve les membres de l'équipe actuellement ou prochainement absents.

### Règles statiques

Ces règles renvoient une réponse prédéfinie sans interroger la base de données. Exemples :

- **Aide pour le planning** : Instructions sur la modification du planning.
- **Aide pour les congés** : Guide pour poser une demande de congé.
- **Salutations** : Réponses aux messages comme "bonjour" ou "salut".

## Extension du système

Pour ajouter de nouvelles règles :

1. Ouvrez `chatbotRules.js`
2. Ajoutez une nouvelle entrée au tableau `chatbotRules` avec cette structure :

```javascript
{
  id: "mon_id_unique",
  keywords: ["mot-clé1", "mot-clé2", "phrase complète"],
  // Pour une règle avec requête SQL :
  handler: async (userId) => {
    try {
      const [rows] = await connectDB.execute(`VOTRE REQUÊTE SQL`, [userId]);
      // Traitement des résultats
      return {
        text: "Votre réponse formatée",
        actions: [
          { text: "Action suggérée", action: "action_id" }
        ]
      };
    } catch (error) {
      console.error("Erreur:", error);
      return { text: "Message d'erreur", error: true };
    }
  }
  // OU pour une règle statique :
  response: {
    text: "Votre réponse statique",
    actions: [
      { text: "Action suggérée", action: "action_id" }
    ]
  }
}
```

## Avantages par rapport à l'ancien système

1. **Moins coûteux** : Pas de coûts d'API externe.
2. **Plus rapide** : Réponses instantanées sans latence d'API.
3. **Personnalisable** : Facilement adaptable aux besoins spécifiques.
4. **Accès direct aux données** : Intégration directe avec la base de données pour des réponses précises et à jour.
5. **Confidentialité améliorée** : Les données restent dans votre système.

## Limitations

1. **Compréhension limitée** : Ne comprend que les phrases contenant exactement les mots-clés définis.
2. **Pas d'apprentissage** : Ne s'améliore pas automatiquement avec l'usage.
3. **Maintenance manuelle** : Nécessite des mises à jour manuelles pour ajouter de nouvelles règles ou améliorer les existantes.

## Actions disponibles

Le système prend en charge plusieurs actions suggérées qui peuvent être affichées sous forme de boutons :

- `create_vacation` : Redirection vers la création de congé
- `list_vacations` : Affichage des congés de l'utilisateur
- `edit_schedule` : Modification du planning
- `view_global_schedule` : Vue du planning global
- `goto_planning` : Redirection vers la page planning
- `ask_planning` : Nouvelle requête sur le planning
- `ask_vacations` : Nouvelle requête sur les congés
- `ask_team` : Nouvelle requête sur l'équipe
- `ask_help` : Demande d'aide

Pour ajouter de nouvelles actions, modifiez la méthode `handleAction` dans `ChatbotService.js`.
