// Construire la description
let description = `${userName} ${actionType} ${entityName}`;

// Ajouter des détails si disponibles
if (details) {
  let parsedDetails;
  try {
    parsedDetails =
      typeof details === "string" ? JSON.parse(details) : details;
  } catch (e) {
    parsedDetails = details;
  }

  // Cas spécial pour les demandes de congés
  if (entity_type === "vacation") {
    // ... (code pour les congés inchangé)
  }

  // Cas spécial pour les employés
  if (entity_type === "employee") {
    // Pour la création d'employé
    if (type === "create" && parsedDetails.employee_name) {
      // Si on a le créateur de l'employé et l'employé créé
      if (parsedDetails.created_by && parsedDetails.employee_name) {
        return `${parsedDetails.created_by} a créé un nouvel employé : ${parsedDetails.employee_name}`;
      }
      // Fallback sur le format standard avec le nom de l'employé
      return `${userName} a créé un nouvel employé : ${parsedDetails.employee_name}`;
    }
    
    // Pour la suppression d'employé 
    if (type === "delete" && parsedDetails.employee_name) {
      // Si on a l'auteur de la suppression et l'employé supprimé
      if (parsedDetails.deleted_by && parsedDetails.employee_name) {
        return `${parsedDetails.deleted_by} a supprimé l'employé : ${parsedDetails.employee_name}`;
      }
      // Fallback sur le format standard avec le nom de l'employé
      return `${userName} a supprimé l'employé : ${parsedDetails.employee_name}`;
    }
    
    // Pour les modifications de solde d'heures (cas existant)
    if (
      parsedDetails.action &&
      (parsedDetails.action === "Ajout d'heures" ||
        parsedDetails.action === "Soustraction d'heures")
    ) {
 