var HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: 'dist',
    filename: 'index.bundle.[hash].js'
  },

	module: {
		loaders: [
			{ test: /\.coffee$/, loader: "coffee-loader" },
			{ test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" },
			{ test: /\.vue$/, loader: 'vue' }
		]
	},
	
  plugins: [ new HTMLWebpackPlugin ({
	}) ],
};
