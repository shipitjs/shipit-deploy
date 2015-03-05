module.exports = function (grunt) {
  require('./deploy')(grunt);
  require('./rollback')(grunt);
  require('./pending')(grunt);
};
