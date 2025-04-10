module.exports = {
  e2e: {
    baseUrl: "https://smartplanning.fr",
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 800,
    chromeWebSecurity: false, // Important pour permettre les requêtes cross-domain
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    env: {
      apiUrl: "https://smartplanning-api.onrender.com",
    },
  },
};
