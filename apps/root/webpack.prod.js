const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const env = dotenv.config();

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.REACT_APP_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),
  ],
  optimization: {
    minimize: true,
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
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
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
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
      maxInitialRequests: 25,
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
          priority: -10,
          reuseExistingChunk: true,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-redux|@rainbow-me)[\\/]/,
          name: 'vendor.react',
          chunks: 'all',
          priority: 1,
        },
        web3: {
          test: /[\\/]node_modules[\\/](wagmi|@wagmi|viem)[\\/]/,
          name: 'vendor.web3',
          chunks: 'all',
          priority: 2,
        },
        ui: {
          test: /[\\/]node_modules[\\/](@emotion|styled-components|recharts|ui-library)[\\/]/,
          name: 'vendor.ui',
          chunks: 'all',
          priority: 1,
        },
        pages: {
          test: /[\\/]src[\\/]pages[\\/]/,
          name: 'pages',
          chunks: 'async',
          minChunks: 1,
          priority: 5,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
});
