const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const PostCssPipelineWebpackPlugin = require('postcss-pipeline-webpack-plugin');

const criticalSplit = require('postcss-critical-split');
const csso = require('postcss-csso');

module.exports = {
	entry: './src/js/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'js/bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.(jpg|png|jpeg|gif|apng|bmp)$/,
				loader: 'file-loader',
				options: {
					name: 'images/[name].[hash:8].[ext]'
				}
			},
			{
				test: /\.(ttf|eot|otf|woff|woff2)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'fonts/[name].[hash:8].[ext]'
					}
				}
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(['./build']),
		new HtmlWebpackPlugin({template: './src/html/webpack.html'}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].css',
			chunkFilename: 'css/[name].css'
		}),
		new PostCssPipelineWebpackPlugin({
			suffix: 'critical',
			pipeline: [
				criticalSplit({
					output: criticalSplit.output_types.CRITICAL_CSS
				})
			]
		}),
		new PostCssPipelineWebpackPlugin({
			suffix: 'min',
			pipeline: [
				csso({
					restructure: false
				})
			],
			map: {
				inline: false
			}
		})

	]
};
