const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const tsTransformer = require('@formatjs/ts-transformer');

module.exports = {
  entry: {
    app: './src/index.jsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Production',
      template: './public/index.html',
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers() {
            return {
              before: [
                tsTransformer.transform({
                  overrideIdFn: '[sha512:contenthash:base64:6]',
                }),
              ],
            };
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
