const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ARCX_KEY': JSON.stringify('d29e39ede5b6c264036d4bd2697b560f84b45d084295676112d9b635d6271ccd'),
    }),
  ],
});
