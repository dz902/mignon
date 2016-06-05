var HTMLWebpackPlugin = require('html-webpack-plugin');
var JasmineWebpackPlugin = require('jasmine-webpack-plugin');

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
			{ test: /\.coffee$/, loader: "coffee-loader" },
			{ test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" },
			{ test: /\.vue$/, loader: 'vue' }
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
		})
	],
};
