// config-overrides.js
const { override, addWebpackResolve } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "buffer": require.resolve("buffer/")
    }
  }),
  (config) => {
    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ]);
    return config;
  }
);