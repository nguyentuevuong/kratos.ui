const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env) => {
    return [{
        mode: env && env.prod ? 'production' : 'development',
        stats: {
            modules: false
        },
        resolve: {
            extensions: ['.js', '.ts'],
            alias: {
                '@app': path.join(__dirname, 'ClientApp', '@app'),
                '@views': path.join(__dirname, 'ClientApp', 'views')
            }
        },
        module: {
            rules: [
                { test: /\.(css|txt|md)$/, loaders: ['raw-loader'] },
                { test: /\.ts$/, include: /ClientApp/, loaders: ['ts-loader'] },
                {
                    test: /\.html$/, loaders: [
                        'raw-loader',
                        {
                            loader: 'html-minify-loader',
                            options: {
                                cdata: true,
                                quotes: true,
                                comments: true,
                                dom: { lowerCaseTags: false }
                            }
                        }
                    ]
                },
                { test: /\.(png|jpg|jpeg|gif|svg)$/, loaders: ['url-loader?limit=100000'] },
                { test: /\.(sa|sc)ss$/, include: /(views|components)/, loaders: ['raw-loader', 'sass-loader'] },
                { test: /\.(sa|sc)ss$/, include: /styles/, loaders: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] }
            ]
        },
        entry: {
            bundles: [
                './ClientApp/index.html',
                './ClientApp/boot.browser.ts',
                './ClientApp/styles/dashboard.scss'
            ]
        },
        output: {
            path: path.join(__dirname, 'wwwroot', 'dist'),
            publicPath: 'dist/',
            filename: '[name].js'
        },
        optimization: {
            minimize: env && env.prod,
            splitChunks: {
                chunks: 'async',
                minSize: 30000,
                maxSize: 0,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true
                    }
                }
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    uglifyOptions: {
                        compress: true,
                        ecma: 6,
                        mangle: true,
                        output: {
                            comments: false
                        }
                    },
                    sourceMap: false
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessor: require("cssnano"),
                    cssProcessorOptions: {
                        discardComments: {
                            removeAll: true,
                        },
                        // Run cssnano in safe mode to avoid
                        // potentially unsafe transformations.
                        safe: true,
                    },
                    canPrint: false
                })
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: './ClientApp/index.html', to: '../index.html' }
            ]),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: '[name].css',
                chunkFilename: '[id].css',

            }),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./wwwroot/dist/vendor-manifest.json')
            }),
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                // Remove this line if you prefer inline source maps
                filename: '[file].map',
                // Point sourcemap entries to the original file locations on disk
                moduleFilenameTemplate: path.relative('./wwwroot/dist', '[resourcePath]')
            })
        ],
        devServer: {
            contentBase: path.join(__dirname, 'wwwroot'),
            compress: true,
            port: 3000,
            watchOptions: {
                poll: true
            },
            watchContentBase: true,
            index: './index.htm',
            historyApiFallback: true
        },
        node: {
            __filename: true,
            __dirname: true,
        }
    }];
};