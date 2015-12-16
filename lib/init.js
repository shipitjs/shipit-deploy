var path = require('path2/posix');
var _ = require('lodash');

module.exports = function(shipit) {
  shipit.currentPath = path.join(shipit.config.deployTo, '' + shipit.config.currentPath + '');
  shipit.releasesPath = path.join(shipit.config.deployTo, '' + shipit.config.releasesPath + '');
  shipit.config.gitLogFormat = shipit.config.gitLogFormat || '%h: %s - %an';
  _.assign(shipit.constructor.prototype, require('./shipit'));

  return shipit;
};
