const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ETH_NETWORK': JSON.stringify('mainnet'),
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    contentBase: './dist',
    historyApiFallback: true,
  },
});
