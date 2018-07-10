const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: {
		'./assets/js/index.js': [
			'./src/index.js'
		],
		'./assets/css/style.css': [
			'./src/index.less',
			'./node_modules/leaflet/dist/leaflet.css'
		]
	},
	output: {
		filename: '[name]',
		path: path.resolve(__dirname, 'docs')
	},
	devtool: 'inline-source-map',
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Pixel Battle',
			template: './src/index.html'
		}),
		new ExtractTextPlugin('[name]'),
		new Dotenv()
	],
	optimization: {
		minimizer: [
			new UglifyJSPlugin({
				extractComments: true,
				sourceMap: false
			})
		]
	},
	devServer: {
		contentBase: "./docs"
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