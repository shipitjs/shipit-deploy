var path = require('path2/posix');
var _ = require('lodash');

module.exports = function(shipit) {

  if ( shipit.config.releasesPath == undefined )
    shipit.config.releasesPath = 'releases';

  if ( shipit.config.currentPath == undefined )
    shipit.config.currentPath = 'current';

  shipit.currentPath = path.join(shipit.config.deployTo, shipit.config.currentPath);
  shipit.releasesPath = path.join(shipit.config.deployTo, shipit.config.releasesPath);
  shipit.config.gitLogFormat = shipit.config.gitLogFormat || '%h: %s - %an';
  _.assign(shipit.constructor.prototype, require('./shipit'));

  return shipit;
};
