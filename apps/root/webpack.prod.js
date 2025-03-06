const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

const env = dotenv.config();

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.REACT_APP_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ids.HashedModuleIdsPlugin(), // Use hashed module ids for better long-term caching
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
      filename: '[path][base].br',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),
  ],
  optimization: {
    minimize: true,
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    concatenateModules: true,
    usedExports: true,
    providedExports: true,
    mangleExports: 'size',
    innerGraph: true,
    sideEffects: true,
    runtimeChunk: {
      name: 'runtime',
    },
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        parallel: true, // Use multi-process parallel running
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
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
            pure_getters: true,
            unsafe_proto: true,
            passes: 3,
            join_vars: true,
            dead_code: true, // Remove unreachable code
            global_defs: {
              'process.env.NODE_ENV': 'production',
            },
          },
          mangle: {
            safari10: true,
            reserved: ['Buffer', 'process', 'setImmediate'],
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
          keep_classnames: false,
          keep_fnames: false,
          module: false,
        },
        extractComments: false, // Don't extract comments to a separate file
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 15,
      minSize: 15000,
      maxSize: 180000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            // Remove @ from package names
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: -10,
          reuseExistingChunk: true,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'vendor.react',
          chunks: 'all',
          priority: 20,
        },
        mui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'vendor.mui',
          chunks: 'all',
          priority: 15,
        },
        web3: {
          test: /[\\/]node_modules[\\/](wagmi|@wagmi|viem|@web3|ethers|@ethersproject)[\\/]/,
          name: 'vendor.web3',
          chunks: 'all',
          priority: 15,
        },
        ui: {
          test: /[\\/]node_modules[\\/](styled-components|recharts|ui-library)[\\/]/,
          name: 'vendor.ui',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },
        pages: {
          test: /[\\/]src[\\/]pages[\\/]/,
          name: 'pages',
          chunks: 'async',
          minChunks: 1,
          priority: 10,
          enforce: true,
        },
        default: false,
      },
    },
  },
});
