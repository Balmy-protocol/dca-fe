const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const tsTransformer = require('@formatjs/ts-transformer');
const webpack = require('webpack');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const WebpackBar = require('webpackbar');
const { mean } = require('lodash');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  entry: {
    app: './src/index.tsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Production',
      template: './public/index.html',
      favicon: './public/favicon.ico',
      inject: false,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
    }),
    new webpack.DefinePlugin({
      'process.env.ETHPLORER_KEY': JSON.stringify('EK-7xNxe-HDazjQ3-smGdU'),
    }),
    new webpack.DefinePlugin({
      'process.env.ETHERSCAN_API': JSON.stringify('4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF'),
    }),
    new WebpackBar(),
  ],
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      assert: require.resolve('assert/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
    },
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] },
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            // Limit at 50k. Above that it emits separate files
            limit: 50000,
            // url-loader sets mimetype if it's passed.
            // Without this it derives it from the file extension
            mimetype: 'application/font-woff',
            // Output below fonts directory
            name: 'fonts/[name].[ext]',
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          allowTsInNodeModules: true,
          getCustomTransformers() {
            return {
              before: [
                tsTransformer.transform({
                  overrideIdFn: '[sha512:contenthash:base64:6]',
                }),
                styledComponentsTransformer,
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
