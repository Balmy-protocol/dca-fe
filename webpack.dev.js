const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ETH_NETWORK': JSON.stringify('ropsten'),
    }),
    new webpack.DefinePlugin({
      'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-prod'),
    }),
    new webpack.DefinePlugin({
      'process.env.DCA_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/dca-ropsten-stable'),
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    contentBase: './dist',
    historyApiFallback: true,
  },
});
