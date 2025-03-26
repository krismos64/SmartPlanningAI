/**
 * Schémas de validation pour les différentes routes de l'API
 */

const Joi = require("joi");

// Schéma de validation pour le planning automatique
const autoScheduleSchema = Joi.object({
  // Champ obligatoire : date de début de semaine (format YYYY-MM-DD)
  weekStart: Joi.date().iso().required().messages({
    "date.base": "La date de début doit être une date valide",
    "date.format": "La date de début doit être au format YYYY-MM-DD",
    "any.required": "La date de début de semaine est requise",
  }),

  // Champ obligatoire : ID du département
  departmentId: Joi.number().integer().positive().required().messages({
    "number.base": "L'ID du département doit être un nombre",
    "number.integer": "L'ID du département doit être un entier",
    "number.positive": "L'ID du département doit être positif",
    "any.required": "L'ID du département est requis",
  }),

  // Champ obligatoire : heures d'ouverture par jour de la semaine
  businessHours: Joi.object({
    Monday: Joi.array().items(Joi.number().min(0).max(24)).length(2).required(),
    Tuesday: Joi.array()
      .items(Joi.number().min(0).max(24))
      .length(2)
      .required(),
    Wednesday: Joi.array()
      .items(Joi.number().min(0).max(24))
      .length(2)
      .required(),
    Thursday: Joi.array()
      .items(Joi.number().min(0).max(24))
      .length(2)
      .required(),
    Friday: Joi.array().items(Joi.number().min(0).max(24)).length(2).required(),
    Saturday: Joi.array()
      .items(Joi.number().min(0).max(24))
      .length(2)
      .optional(),
    Sunday: Joi.array().items(Joi.number().min(0).max(24)).length(2).optional(),
  })
    .required()
    .messages({
      "object.base": "Les heures d'ouverture doivent être un objet",
      "any.required": "Les heures d'ouverture sont requises",
    }),

  // Champ facultatif : préférences des employés
  employeePreferences: Joi.object()
    .pattern(
      Joi.number().integer().positive(), // Clé : ID d'employé
      Joi.object({
        // Pour chaque jour, tableau de créneaux horaires préférés
        Monday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange", {
                  message:
                    "L'heure de début doit être inférieure à l'heure de fin",
                });
              }
              return value;
            })
          )
          .optional(),
        Tuesday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange");
              }
              return value;
            })
          )
          .optional(),
        Wednesday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange");
              }
              return value;
            })
          )
          .optional(),
        Thursday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange");
              }
              return value;
            })
          )
          .optional(),
        Friday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange");
              }
              return value;
            })
          )
          .optional(),
        Saturday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange");
              }
              return value;
            })
          )
          .optional(),
        Sunday: Joi.array()
          .items(
            Joi.object({
              start: Joi.number().min(0).max(24).required(),
              end: Joi.number().min(0).max(24).required(),
            }).custom((value, helpers) => {
              if (value.start >= value.end) {
                return helpers.error("custom.invalidTimeRange");
              }
              return value;
            })
          )
          .optional(),
      })
    )
    .optional()
    .messages({
      "object.base": "Les préférences des employés doivent être un objet",
    }),

  // Champ facultatif : semaine source à cloner
  sourceWeek: Joi.date().iso().optional().messages({
    "date.base": "La semaine source doit être une date valide",
    "date.format": "La semaine source doit être au format YYYY-MM-DD",
  }),

  // Champ facultatif : nombre minimum d'employés par créneau
  minimumEmployees: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      "number.base": "Le nombre minimum d'employés doit être un nombre",
      "number.integer": "Le nombre minimum d'employés doit être un entier",
      "number.min": "Le nombre minimum d'employés doit être d'au moins 1",
    }),

  // Champ facultatif : équilibrage des rôles
  balanceRoles: Joi.boolean().default(true).optional().messages({
    "boolean.base": "L'équilibrage des rôles doit être un booléen",
  }),
});

// Export des schémas pour utilisation dans les contrôleurs
module.exports = {
  autoScheduleSchema,
};
