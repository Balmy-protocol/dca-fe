const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      ETH_NETWORK: JSON.stringify('mainnet'),
    }),
  ],
});
