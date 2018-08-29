const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
	entry: {
		'./assets/js/index.js': [
			'./src/front/index.js'
		],
		'./serviceWorker.js': [
			'./src/front/serviceWorker.js'
		],
		'./assets/css/style.css': [
			'./src/front/index.less',
			'./node_modules/leaflet/dist/leaflet.css',
			'./node_modules/leaflet-search/dist/leaflet-search.min.css'
		]
	},
	output: {
		filename: '[name]',
		path: path.resolve(__dirname, 'public')
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Pixel Battle',
			template: './src/front/index.html',
			excludeAssets: /serviceWorker.*.js/
		}),
		new HtmlWebpackExcludeAssetsPlugin(),
		new ExtractTextPlugin('[name]'),
		new Dotenv(),
		new CopyWebpackPlugin([
			{ from: './src/front/static/', to: './' },
			{ from: './node_modules/leaflet-search/images/search-icon.png', to: './assets/images/'},
			{ from: './node_modules/leaflet-search/images/loader.gif', to: './assets/images/'},
		])
	],
	devServer: {
		stats: {
			chunks: false
		}
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: "css-loader", 
							options: { minimize: true }
						},
						{
							loader: "less-loader"
						}
					]
				})
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: 'css-loader',
							options: { minimize: true, url: false },
						}
					]
				})
			},
		]
	},
};