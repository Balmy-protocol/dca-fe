const path = require('path');
const dotenv = require('dotenv/config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const tsTransformer = require('@formatjs/ts-transformer');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const WebpackBar = require('webpackbar');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  entry: {
    app: './src/index.tsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Production',
      template: './public/index.html',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
    }),
    new CopyPlugin({
      patterns: [{ from: './public_metadata' }],
    }),
    new webpack.DefinePlugin({
      'process.env.ETHPLORER_KEY': JSON.stringify(process.env.ETHPLORER_KEY),
    }),
    new webpack.DefinePlugin({
      'process.env.ETHERSCAN_API': JSON.stringify(process.env.ETHERSCAN_API),
    }),
    new webpack.DefinePlugin({
      'process.env.MIXPANEL_TOKEN': JSON.stringify(process.env.MIXPANEL_TOKEN),
    }),
    new webpack.DefinePlugin({
      'process.env.WC_PROJECT_ID': JSON.stringify(process.env.WC_PROJECT_ID),
    }),
    new webpack.DefinePlugin({
      'process.env.MEAN_API_URL': JSON.stringify(process.env.MEAN_API_URL),
    }),
    new webpack.DefinePlugin({
      'process.env.TOKEN_LIST_URL': JSON.stringify(process.env.TOKEN_LIST_URL),
    }),
    new webpack.DefinePlugin({
      'process.env.ENABLED_TRANSLATIONS': JSON.stringify(process.env.ENABLED_TRANSLATIONS),
    }),
    new webpack.DefinePlugin({
      'process.env.HOTJAR_PAGE_ID': JSON.stringify(process.env.HOTJAR_PAGE_ID),
    }),
    new WebpackBar(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 4096,
      },
    }),
  ],
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@abis': path.resolve(__dirname, 'src/abis'),
      '@fonts': path.resolve(__dirname, 'src/fonts'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@frame': path.resolve(__dirname, 'src/frame'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@lang': path.resolve(__dirname, 'src/lang'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@state': path.resolve(__dirname, 'src/state'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
    extensions: ['.*', '.js', '.jsx', '.ts', '.tsx'],
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
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};
