const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

// En développement uniquement
const isDev = process.env.NODE_ENV === "development";
// Utiliser l'URL définie dans l'environnement ou l'URL de production si en production
const target = isDev
  ? "http://localhost:5001"
  : "https://smartplanning-api.onrender.com";

module.exports = function (app) {
  if (isDev) {
    app.use(
      "/api",
      createProxyMiddleware({
        target,
        changeOrigin: true,
      })
    );
  }
};
