var webpack = require('webpack');
var path    = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var config  = require('./webpack.config');

config.output = {
  filename: '[name].bundle.js',
  publicPath: '',
  path: path.resolve(__dirname, 'dist')
};

config.plugins = config.plugins.concat([

  // Reduces bundles total size
  new webpack.optimize.UglifyJsPlugin({
    mangle: {

      // You can specify all variables that should not be mangled.
      // For example if your vendor dependency doesn't use modules
      // and relies on global variables. Most of angular modules relies on
      // angular global variable, so we should keep it unchanged
      except: ['$super', '$', 'exports', 'require', 'angular']
    }
  })
]);

config.plugins = config.plugins.concat([

// Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
    new CopyWebpackPlugin([
      {from: __dirname + '/public'}
     ])
]);

module.exports = config;