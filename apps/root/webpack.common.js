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
    buildDependencies: {
      config: [__filename],
    },
    name: 'production-cache',
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
      include: ['initial', 'asyncChunks'],
      fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime.*.js$/],
      as(entry) {
        if (/\.css$/.test(entry)) return 'style';
        if (/\.woff2?$/.test(entry)) return 'font';
        if (/\.(png|svg|jpg|jpeg|gif)$/.test(entry)) return 'image';
        return 'script';
      },
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
          requiredVersion: packageJson.dependencies['styled-components'],
        },
        '@rainbow-me/rainbowkit': {
          singleton: true,
          eager: false,
          requiredVersion: packageJson.dependencies['@rainbow-me/rainbowkit'],
        },
        wagmi: {
          singleton: true,
          eager: false,
          requiredVersion: packageJson.dependencies.wagmi,
        },
        '@wagmi/core': {
          singleton: true,
          eager: false,
          requiredVersion: packageJson.dependencies['@wagmi/core'],
        },
        viem: {
          singleton: true,
          eager: false,
          requiredVersion: packageJson.dependencies.viem,
        },
        'ui-library': {
          singleton: true,
          requiredVersion: packageJson.dependencies['ui-library'],
        },
        '@mui/material': {
          singleton: true,
          requiredVersion: uiLibraryPackageJson.dependencies['@mui/material'],
        },
        '@mui/icons-material': {
          singleton: true,
          requiredVersion: uiLibraryPackageJson.dependencies['@mui/icons-material'],
        },
        recharts: {
          singleton: true,
          requiredVersion: packageJson.dependencies.recharts,
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
              },
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
    ],
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    concatenateModules: true,
    innerGraph: true,
    sideEffects: true,
  },
};
