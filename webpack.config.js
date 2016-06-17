var HTMLWebpackPlugin = require('html-webpack-plugin');
var JasmineWebpackPlugin = require('jasmine-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
  	index: './src/index.js', 
  	test: './test/runner.js'
  },
  
  output: {
    path: 'dist',
    filename: '[name].bundle.[hash].js'
  },

	module: {
		loaders: [
			{ test: /\.jade$/, loader: "jade-loader" },
			{ test: /\.sass$/, loader: ExtractTextPlugin.extract("style-loader", "!css!sass!") }
		]
	},

	node: {
		fs: 'empty'
	},

  plugins: [
  	new HTMLWebpackPlugin ({
  		chunks: ['index'],
  		template: './src/index.html',
  		filename: 'index.html'
		}),
		new JasmineWebpackPlugin ({
			chunks: ['test'],
			filename: 'test.html'
		}),
		new ExtractTextPlugin("[name].bundle.[hash].css")
	],
};
