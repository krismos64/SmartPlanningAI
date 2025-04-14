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
    console.error("Variables d'environnement chargées:", {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DB_HOST: process.env.DB_HOST,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Défini" : "Non défini",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        ? "Défini"
        : "Non défini",
    });
    return;
  }

  console.log("🔑 Initialisation de la stratégie Google avec:");
  console.log(
    `- Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`
  );
  console.log(`- Mode: ${process.env.NODE_ENV || "development"}`);

  // Configuration de la stratégie Google
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? "https://smartplanning.fr/api/auth/google/callback"
            : "http://localhost:5001/api/auth/google/callback",
        scope: ["profile", "email"],
        state: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || !profile.emails[0]) {
            return done(
              new Error("L'email est requis pour l'authentification"),
              null
            );
          }

          const email = profile.emails[0].value;
          let user = await User.findByEmail(email);

          if (user) {
            return done(null, user);
          }

          // Création d'un nouvel utilisateur
          const newUser = await User.create({
            email: email,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            role: "admin",
            provider: "google",
            password: Math.random().toString(36).slice(-20),
            profileImage: profile.photos?.[0]?.value || null,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  console.log("✅ Stratégie d'authentification Google configurée avec succès");
};

// Exécuter la configuration immédiatement
setupGoogleStrategy();

module.exports = setupGoogleStrategy;
