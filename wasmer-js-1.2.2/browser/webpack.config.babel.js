import path from 'path'
import webpack from 'webpack'

module.exports = {
  mode: 'production',
  entry: {
    main: './src/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'public/assets'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
  },
  plugins: [
    new webpack.ProvidePlugin({
      // process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      'wasmer_wasi_js_bg.wasm': false,
    },
  },
  module: {
    rules: [
      {test: /\.ts$/, exclude: /node_modules/, use: {loader: 'ts-loader'}},
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all',
        },
      },
    },
  },
}
