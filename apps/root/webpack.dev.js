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
      client: {
        overlay: false,
      },
    },
    // }),
  });
