module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['karma-typescript', 'mocha', 'chai'],
    files: [
      'src/ts/*.spec.ts'
    ],
    exclude: [
    ],
    preprocessors: {
      'src/ts/*.spec.ts': ['karma-typescript']
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity,
    phantomjsLauncher: {exitOnResourceError: true}
  });
};
