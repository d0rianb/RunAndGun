const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const dev = process.env.NODE_ENV === "dev"

let config = {
	entry: ['./src/main.ts'],
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: 'dist/',
		filename: '[name].bundle.js'
	},
	context: __dirname,
	devtool: dev ? 'eval-source-map' : false,
	devServer: {
		hot: true,
		noInfo: true
	},
	watch: dev,
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
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
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.txt$/i,
				use: 'raw-loader',
			}
		]
	},
	target: 'web',
	plugins: []
};

module.exports = config
