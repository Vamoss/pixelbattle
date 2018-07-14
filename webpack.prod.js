const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
    optimization: {
		minimizer: [
			new UglifyJSPlugin({
				extractComments: true
			})
		]
	}
});