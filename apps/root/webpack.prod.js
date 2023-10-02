const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const dotenv = require('dotenv');

const env = dotenv.config();

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ARCX_KEY': JSON.stringify(process.env.ARCX_KEY),
    }),
  ],
});
