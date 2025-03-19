const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          net: false,
          tls: false,
          timers: require.resolve("timers-browserify"),
          stream: require.resolve("stream-browserify"),
          buffer: require.resolve("buffer/"),
          url: require.resolve("url/"),
          util: require.resolve("util/"),
          crypto: require.resolve("crypto-browserify"),
          process: require.resolve("process/browser"),
        },
      },
    },
  },
};
