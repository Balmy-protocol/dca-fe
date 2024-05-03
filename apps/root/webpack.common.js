const path = require('path');
const dotenv = require('dotenv/config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const tsTransformer = require('@formatjs/ts-transformer');
const webpack = require('webpack');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const WebpackBar = require('webpackbar');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  entry: {
    app: './src/index.tsx',
  },
  optimization: {
    minimize: true,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxSize: 5 * 1024 * 1024,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Production',
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
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
    new WebpackBar(),
    new CopyPlugin({
      patterns: [
        { from: './public/android-chrome-192x192.png' },
        { from: './public/android-chrome-512x512.png' },
        { from: './public/apple-touch-icon.png' },
        { from: './public/favicon-16x16.png' },
        { from: './public/favicon-32x32.png' },
        { from: './public/manifest.json' },
        { from: './public/mstile-150x150.png' },
        { from: './public/safari-pinned-tab.svg' },
      ],
    }),
  ],
  devtool: 'source-map',
  output: {
    filename: '[name].bundle.js',
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
