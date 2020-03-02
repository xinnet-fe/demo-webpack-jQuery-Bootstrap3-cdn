'use strict'
const fs = require('fs')
const path = require('path')
const pathJoin = require('path').join
const HtmlWebpackPlugin = require('html-webpack-plugin')
const config = require('../config')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')
/**
 * @param startPath  起始目录文件夹路径
 * @returns {Array}
 */
function findFilePathAndName(startPath) {
	let names = []
	let paths = []

	function findNext(path) {
		let files = fs.readdirSync(path);
		files.forEach((val, idx) => {
			let fPath = pathJoin(path, val);
			let stats = fs.statSync(fPath);

			if (stats.isDirectory() && val !== 'commonjs') {
				findNext(fPath)
			}
			if (stats.isFile() && fPath.indexOf(".js") > 0) {
				paths.push(fPath)
				names.push(val.split(".")[0])
			}
		})
	}
	findNext(startPath)
	// console.log(paths)
	// console.log(names)
	return {
		names: names,
		paths: paths
	};
}
// let filesJs = findFilePathAndName('./src/htmljs')
let filesHtml = findFilePathAndName('./src')
exports.entryList = () => {
	let entryList = {};
	filesHtml.names.map((v, i, arr) => {
		// console.log(path.resolve(filesHtml.paths[i]))
		let url = filesHtml.paths[i].split("src")[1].split(".")[0]
		// url = url.substr(0, url.lastIndexOf('\\'))
		entryList[v] = path.resolve(filesHtml.paths[i])
	});
	return entryList;
}
exports.htmlPluginList = () => {
	const pageList = []
	filesHtml.names.map((v, i, arr) => {
		pageList.push(
			new HtmlWebpackPlugin({
				filename: path.resolve(filesHtml.paths[i]).replace(/src/, 'dist').split(".")[0] + '.html',
				template: path.resolve(filesHtml.paths[i]).replace(/\.js/, '.ejs'),
				chunks: ['commoncss', 'commonjs', 'jquery', 'bootstrap', v],
				inject: 'body', // js的script注入到body底部
				//压缩配置
				minify: {
					//删除Html注释
					removeComments: true,
					//去除空格
					collapseWhitespace: true,
					//去除属性引号
					removeAttributeQuotes: true
				},
				chunksSortMode: 'dependency'
			})
		)
	})
	return pageList
}
exports.assetsPath = function (_path) {
	const assetsSubDirectory = process.env.NODE_ENV === 'production'
		? config.build.assetsSubDirectory
		: config.dev.assetsSubDirectory

	return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
	options = options || {}

	const cssLoader = {
		loader: 'css-loader',
		options: {
			sourceMap: options.sourceMap
		}
	}

	const postcssLoader = {
		loader: 'postcss-loader',
		options: {
			sourceMap: options.sourceMap
		}
	}

	// generate loader string to be used with extract text plugin
	function generateLoaders(loader, loaderOptions) {
		const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

		if (loader) {
			loaders.push({
				loader: loader + '-loader',
				options: Object.assign({}, loaderOptions, {
					sourceMap: options.sourceMap
				})
			})
		}

		// Extract CSS when that option is specified
		// (which is the case during production build)
		if (options.extract) {
			// return ExtractTextPlugin.extract({
			// 	use: loaders,
			// 	fallback: 'vue-style-loader'
			// })
		} else {
			// return ['vue-style-loader'].concat(loaders)
			return loaders
		}
	}

	// https://vue-loader.vuejs.org/en/configurations/extract-css.html
	return {
		css: generateLoaders(),
		postcss: generateLoaders(),
		less: generateLoaders('less'),
		sass: generateLoaders('sass', { indentedSyntax: true }),
		scss: generateLoaders('sass'),
		stylus: generateLoaders('stylus'),
		styl: generateLoaders('stylus')
	}
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
	const output = []
	const loaders = exports.cssLoaders(options)

	for (const extension in loaders) {
		const loader = loaders[extension]
		output.push({
			test: new RegExp('\\.' + extension + '$'),
			use: loader
		})
	}

	return output
}

exports.createNotifierCallback = () => {
	const notifier = require('node-notifier')

	return (severity, errors) => {
		if (severity !== 'error') return

		const error = errors[0]
		const filename = error.file && error.file.split('!').pop()

		notifier.notify({
			title: packageConfig.name,
			message: severity + ': ' + error.name,
			subtitle: filename || '',
			// icon: path.join(__dirname, 'logo.png')
		})
	}
}