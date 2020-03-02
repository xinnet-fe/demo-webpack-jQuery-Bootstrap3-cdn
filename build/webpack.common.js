const path = require('path')
const config = require('../config')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const utils = require('./utils')

module.exports = {
    context: path.join(__dirname, '../'),
    externals: {
        jquery: 'jQuery'
    },
    // 入口JS路径
    entry: utils.entryList(),
    resolve: {
        alias: {
            '@': path.join(__dirname, '../src'),
        }
    },
    plugins: [
        // 自动清空dist目录
        new CleanWebpackPlugin(),
        // copy static 
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../src/static'),
                to: 'static'
            }
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery-1x',
            jQuery: 'jquery-1x'
        }),
        // 分离样式到css文件
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].min.css'
        }),
        ...utils.htmlPluginList()
    ],
    // 编译输出路径
    output: {
        // js生成到dist/static/js，[name]表示保留原js文件名
        filename: 'static/js/[name].min.js',
        // 输出路径为dist
        path: config.build.assetsRoot,
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        // 将原来的style-loader替换
                        loader: MiniCssExtractPlugin.loader,
                        // options: {
                        //     // css中的图片路径增加前缀
                        //     publicPath: '../'
                        // }
                    },
                    // 'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif|webp)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // 最终生成的css代码中,图片url前缀
                            // publicPath: 'static/images',
                            // 图片输出的实际路径(相对于dist)
                            outputPath: './static/images',
                            // 当小于某KB时转为base64
                            limit: 0,
                            esModule: false
                        }
                    }
                ]
            },
            {
                test: /\.(html)$/,
                // use: ['html-withimg-loader']
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'img:data-src', 'audio:src'],
                        minimize: true
                    }
                }
            },
            {
                test: /\.ejs/,
                use: ['ejs-loader'],
            },
            {
                test: /\.less$/,
                loader: 'style-loader!postcss-loader!less-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: 'font/[name].[ext]?[hash]'
                    }
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                // vendors: {
                //     test: /[\\/]node_modules[\\/]/,
                //     chunks: "all",
                //     minChunks: 2,
                //     priority: 18,
                // },
                // 提取公共jquery文件
                // jquery: {
                //     test: /jquery/,
                //     name: 'jquery',
                //     chunks: 'all',
                //     priority: 20,
                //     reuseExistingChunk: true
                // },
                // bootstrap: {
                //     test: /bootstrap/,
                //     name: 'bootstrap',
                //     chunks: 'all',
                //     priority: 19,
                //     reuseExistingChunk: true
                // },
                // 提取公共js文件
                common_js: {
                    test: /[\\/]commonjs[\\/].+\.js$/,
                    name: 'commonjs',
                    chunks: 'all',
                    enforce: true,
                    priority: 18,
                    reuseExistingChunk: true
                },
                // 提取公共css文件
                common_css: {
                    test: /[\\/]common[\\/].+\.css$/,
                    name: 'commoncss',
                    chunks: 'all',
                    enforce: true,
                    priority: 17,
                    reuseExistingChunk: true
                }
            }
        },
        // 解决IE8“缺少标识符”错误
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    ie8: true
                }
            })
        ]
    },
    node: {
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
}