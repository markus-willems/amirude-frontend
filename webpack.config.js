const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = env => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.[chunkHash].js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new Dotenv({
        path: env.env === 'prod' ? './.prod.env' : './.dev.env'
      })
    ]
  }
}
