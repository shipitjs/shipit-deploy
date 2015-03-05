var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path');

/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:init', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
    shipit.emit('deploy');
  }
};
