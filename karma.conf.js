var webpackConf = require('./webpack.config');

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['src/ts/*.spec.ts'],
    exclude: [],
    preprocessors: {'src/ts/*.ts': ['webpack']},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    mime: {'text/x-typescript': ['ts']},
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity,
    phantomjsLauncher: {exitOnResourceError: true},
    client: {captureConsole: true},
    webpack: {
      module: webpackConf.module,
      resolve: webpackConf.resolve
    }
  });
};
