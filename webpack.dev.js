const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
	devtool: 'inline-source-map',
	watch: true,
	watchOptions: {
		ignored: ['src/node', 'node_modules']
	}
});