const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports =
  // smp.wrap({...
  merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      https: true,
      client: {
        overlay: false,
      },
    },
    snapshot: {
      unmanagedPaths: [
        path.resolve(__dirname, '../../node_modules/ui-library'),
        path.resolve(__dirname, '../../node_modules/common-types'),
      ],
    },
    // }),
  });
