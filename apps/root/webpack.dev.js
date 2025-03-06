const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

// Uncomment if you want to measure build performance
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
// const smp = new SpeedMeasurePlugin();

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map', // Faster and still good for debugging
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: false,
    },
    compress: true, // Enable gzip compression for everything served
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
  optimization: {
    removeAvailableModules: false, // Skip this optimization in development for faster builds
    removeEmptyChunks: false, // Skip this optimization in development for faster builds
    splitChunks: false, // Skip this optimization in development for faster builds
    runtimeChunk: true, // Enable runtime chunk for better caching
  },
  snapshot: {
    unmanagedPaths: [
      path.resolve(__dirname, '../../node_modules/ui-library'),
      path.resolve(__dirname, '../../node_modules/common-types'),
    ],
    managedPaths: [/^(.+?[\\/]node_modules[\\/])/], // Better management of node_modules
  },
});
