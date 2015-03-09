var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var init = require('../../lib/init');
var path = require('path2/posix');

/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:init', task);

  function task() {
    var shipit = init(getShipit(gruntOrShipit));
    shipit.emit('deploy');
  }
};
