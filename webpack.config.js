const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'assets/js/index.js',
		path: path.resolve(__dirname, 'dist')
	},
	devtool: 'inline-source-map',
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Pixel Battle',
			template: './src/index.html'
		})
	],
	devServer: {
		contentBase: "./dist"
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					{
						loader: "style-loader"
					},
					{
						loader: "css-loader"
					},
					{
						loader: "less-loader",
						options: {
							strictMath: true,
							noIeCompat: true
						}
					}
				]
			}
		]
	}
};