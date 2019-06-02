const path = require('path')
const fs = require('fs');
const nodeExternals = require('webpack-node-externals')
const dev = process.env.NODE_ENV === "dev"

const config = {
	entry: ['./src/main.ts'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: 'dist/'
	},
	devtool: dev ? 'eval-source-map' : false,
	devServer: {
		hot: true,
		noInfo: true
	},
	watch: dev,
	module: {
		rules: [{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.scss$/,
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "sass-loader", // compiles Sass to CSS
				}]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader'
				]
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	externals: [nodeExternals()],
	node: { fs: 'empty' },
	plugins: []
};

module.exports = config