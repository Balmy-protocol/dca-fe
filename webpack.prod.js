const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'production',
  // -------------rinkeby--------------
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ETH_NETWORK': JSON.stringify('rinkeby'),
    }),
    new webpack.DefinePlugin({
      'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/uniswap-v3-rinkeby'),
    }),
    new webpack.DefinePlugin({
      'process.env.DCA_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/dca-rinkeby-stable'),
    }),
    new webpack.DefinePlugin({
      'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
    }),
    new webpack.DefinePlugin({
      'process.env.FACTORY_ADDRESS': JSON.stringify('0x5f6AD3A83088188e81ff80295F7686e868400C29'),
    }),
  ],
  // -------------mainnet--------------
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.ETH_NETWORK': JSON.stringify('mainnet'),
  //   }),
  //   new webpack.DefinePlugin({
  // 'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.DCA_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/dca-ropsten-stable'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
  //   }),
  // new webpack.DefinePlugin({
  //     'process.env.FACTORY_ADDRESS': JSON.stringify('0x5f6AD3A83088188e81ff80295F7686e868400C29'),
  //   }),
  // ],
});
