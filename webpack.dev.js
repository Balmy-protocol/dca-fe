const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  // -------------mainnet--------------
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ETH_NETWORK': JSON.stringify('mainnet'),
    }),
    new webpack.DefinePlugin({
      'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'),
    }),
    new webpack.DefinePlugin({
      'process.env.DCA_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/mean-finance/dca-v1'),
    }),
    new webpack.DefinePlugin({
      'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
    }),
    new webpack.DefinePlugin({
      'process.env.FACTORY_ADDRESS': JSON.stringify('0xaC4a40a995f236E081424D966F1dFE014Fe0e98A'),
    }),
    new webpack.DefinePlugin({
      'process.env.TOKEN_DESCRIPTOR_ADDRESS': JSON.stringify('0x51B2f9a89cB8033262CE0F7BA8618cafE11cA679'),
    }),
  ],
  // -------------meanfinance--------------
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.ETH_NETWORK': JSON.stringify('meanfinance'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.DCA_GRAPH': JSON.stringify('http://3.235.77.84:8000/subgraphs/name/alejoamiras/dca-subgraph'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.FACTORY_ADDRESS': JSON.stringify('0xaC4a40a995f236E081424D966F1dFE014Fe0e98A'),
  //   }),
  // ],
  // -------------rinkeby--------------
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.ETH_NETWORK': JSON.stringify('rinkeby'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/uniswap-v3-rinkeby'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.DCA_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/mean-finance/dca-v1-rinkeby'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.FACTORY_ADDRESS': JSON.stringify('0xaC4a40a995f236E081424D966F1dFE014Fe0e98A'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.TOKEN_DESCRIPTOR_ADDRESS': JSON.stringify('0x51B2f9a89cB8033262CE0F7BA8618cafE11cA679'),
  //   }),
  // ],
  // -------------ropsten--------------
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.ETH_NETWORK': JSON.stringify('ropsten'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.UNI_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/uniswap-v3-ropsten'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.DCA_GRAPH': JSON.stringify('https://api.thegraph.com/subgraphs/name/alejoamiras/dca-ropsten-stable'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
  //   }),
  //   new webpack.DefinePlugin({
  //     'process.env.FACTORY_ADDRESS': JSON.stringify('0xaC4a40a995f236E081424D966F1dFE014Fe0e98A'),
  //   }),
  // ],
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    contentBase: './dist',
    historyApiFallback: true,
  },
});
