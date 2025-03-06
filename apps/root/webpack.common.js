const path = require('path');
const dotenv = require('dotenv/config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const tsTransformer = require('@formatjs/ts-transformer');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const WebpackBar = require('webpackbar');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const packageJson = require('./package.json');
const uiLibraryPackageJson = require('../../packages/ui-library/package.json');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  entry: {
    app: './src/index.tsx',
  },
  cache: {
    type: 'filesystem',
    compression: 'gzip',
    name: process.env.NODE_ENV === 'production' ? 'production-cache' : 'development-cache',
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    version: '1.1',
    maxMemoryGenerations: 1,
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
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      include: ['initial'],
      as(entry) {
        if (/\.css$/.test(entry)) return 'style';
        if (/\.woff2?$/.test(entry)) return 'font';
        if (/\.(png|svg|jpg|jpeg|gif)$/.test(entry)) return 'image';
        return 'script';
      },
      fileBlacklist: [/\.map$/, /hot-update\.js$/],
    }),
    new ModuleFederationPlugin({
      name: 'dca_fe',
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: packageJson.dependencies.react,
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: packageJson.dependencies['react-dom'],
        },
        'styled-components': {
          singleton: true,
          eager: true,
          requiredVersion: packageJson.dependencies['styled-components'],
        },
        '@reduxjs/toolkit': {
          singleton: true,
          eager: true,
          requiredVersion: packageJson.dependencies['@reduxjs/toolkit'],
        },
        'react-router-dom': {
          singleton: true,
          eager: true,
          requiredVersion: packageJson.dependencies['react-router-dom'],
        },
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
    enforceExtension: false,
    mainFields: ['browser', 'module', 'main'],
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
            name: 'fonts/[name].[contenthash].[ext]',
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
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[contenthash].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
                dcScanOpt: 2,
              },
              optipng: {
                enabled: true,
                optimizationLevel: 7,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
                strip: true,
              },
              gifsicle: {
                interlaced: false,
                optimizationLevel: 3,
              },
              webp: {
                quality: 80,
                method: 6,
                autoFilter: true,
              },
            },
          },
        ],
      },
    ],
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 600000,
    maxAssetSize: 550000,
    assetFilter: function (assetFilename) {
      return !/\.map$/.test(assetFilename) && !/node_modules/.test(assetFilename);
    },
  },
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    concatenateModules: true,
    innerGraph: true,
    sideEffects: true,
  },
};
