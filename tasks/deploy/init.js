var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');

/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:init', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    shipit.emit('deploy');
  }
};
