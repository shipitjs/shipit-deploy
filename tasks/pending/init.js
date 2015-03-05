var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path');

/**
 * Init task.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'pending:init', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
    shipit.config.gitLogFormat = shipit.config.gitLogFormat || '%h: %s - %an';
  }
};
