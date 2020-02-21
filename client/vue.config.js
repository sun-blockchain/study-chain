const webpack = require('webpack');

module.exports = {
  chainWebpack: (config) => {
    config.performance.maxEntrypointSize(2000000).maxAssetSize(2000000);
  },
  configureWebpack: {
    // Set up all the aliases we use in our app.
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 6
      })
    ]
  },
  pwa: {
    name: 'Vue Argon Dashboard',
    themeColor: '#172b4d',
    msTileColor: '#172b4d',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#172b4d'
  },
  css: {
    sourceMap: true,
    extract: false
  }
};
