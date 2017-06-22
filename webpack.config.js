const path = require('path');

module.exports = {
  entry: "./build/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build/"),
  },

/* // TODO(jzacsh) determine if this can be deleted...
  plugins: [
    new LoaderOptionsPlugin({
      debug: false,
      options: {
        resolve: {
          extensions: ['.ts', '.tsx', '.js']
        }
      }
    })
  ],
*/

  resolve: { extensions: ['.ts', '.js', '.css'] },
  module: {rules: [ {test: /\.ts$/, loader: 'ts-loader'}]}
}
