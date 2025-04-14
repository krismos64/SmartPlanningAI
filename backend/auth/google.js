const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

/**
 * Configuration de la stratégie d'authentification Google OAuth 2.0
 * Cette fonction initialise Passport.js avec la stratégie Google
 */
const setupGoogleStrategy = () => {
  // Vérification des variables d'environnement requises
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error(
      "❌ Erreur: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET doivent être définis dans les variables d'environnement"
    );
    return;
  }

  // Configuration de base d'identification à la session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configuration de la stratégie Google
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
        state: true,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("📱 Profil Google reçu:", {
            id: profile.id,
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : "Email non disponible",
            firstName: profile.name
              ? profile.name.givenName
              : "Prénom non disponible",
            lastName: profile.name
              ? profile.name.familyName
              : "Nom non disponible",
          });

          // Vérifier si l'utilisateur existe déjà avec cet email
          if (!profile.emails || !profile.emails[0]) {
            console.error("❌ L'email est manquant dans le profil Google");
            return done(
              new Error("L'email est requis pour l'authentification"),
              null
            );
          }

          const email = profile.emails[0].value;
          let user = await User.findByEmail(email);

          if (user) {
            console.log(
              `✅ Utilisateur existant trouvé avec l'email: ${email}`
            );
            return done(null, user);
          }

          // Création d'un nouvel utilisateur
          console.log(
            `🆕 Création d'un nouvel utilisateur avec l'email: ${email}`
          );
          const newUser = await User.create({
            email: email,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            role: "admin", // Tous les utilisateurs sont admin par défaut
            provider: "google",
            // Générer un mot de passe aléatoire pour les comptes Google
            password:
              Math.random().toString(36).slice(-10) +
              Math.random().toString(36).slice(-10),
            profileImage:
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : null,
          });

          return done(null, newUser);
        } catch (error) {
          console.error("❌ Erreur lors de l'authentification Google:", error);
          return done(error, null);
        }
      }
    )
  );

  console.log("✅ Stratégie d'authentification Google configurée avec succès");
};

module.exports = setupGoogleStrategy;
