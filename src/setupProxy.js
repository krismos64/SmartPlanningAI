const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

// En développement uniquement
const isDev = process.env.NODE_ENV === "development";
const target = isDev ? "http://localhost:5001" : process.env.REACT_APP_API_URL;

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
