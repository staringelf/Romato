const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry:   {
	  App: './public/app/app.js'
	},
	mode: "production",
	devtool: "source-map",
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, 'public', 'dist'),
    },
	plugins: [new MiniCssExtractPlugin({ filename: "main.css" })],
	module:  {
	  rules: [
		{
			test: /\.scss$/,
			
			use: [
				{
					loader: MiniCssExtractPlugin.loader,
					options: {
						publicPath: ''
					}
				},
				"css-loader",
				"sass-loader"
			]
		},

		{
			test: /\.(svg|png|jp?g|gif)$/,
			use: {
				loader: "file-loader",
				options: {
					name: "[name].[ext]",
					outputPath: "imgs"
				}
			}
		},

		{
		  test: /\.m?js$/,
		  exclude: /node_modules/,
		  use: {
			loader: 'babel-loader',
			options: {
			  presets: [
				['@babel/preset-env', { targets: "defaults" }]
			  ]
			}
		  }
		}
	  ]
	}
}

