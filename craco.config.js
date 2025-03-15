const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Résoudre les problèmes de dépendances pour canvg et jsPDF
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve("process/browser.js"),
        zlib: require.resolve("browserify-zlib"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util"),
        buffer: require.resolve("buffer"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        crypto: require.resolve("crypto-browserify"),
      };

      // Fournir Buffer et process globalement
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser.js",
        })
      );

      // Ignorer les modules Node.js natifs
      webpackConfig.externals = [
        nodeExternals({
          allowlist: [/^(?!process\/browser$).*/],
        }),
      ];

      return webpackConfig;
    },
  },
};
