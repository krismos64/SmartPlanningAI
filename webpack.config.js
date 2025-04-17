const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      util: require.resolve("util/"),
      zlib: require.resolve("browserify-zlib"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url/"),
      crypto: require.resolve("crypto-browserify"),
      assert: require.resolve("assert/"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      "process.env.REACT_APP_API_URL": JSON.stringify(
        process.env.REACT_APP_API_URL || "http://localhost:5001"
      ),
    }),
  ],
};
