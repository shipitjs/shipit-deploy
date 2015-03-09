var utils = require('shipit-utils');
var init = require('../../lib/init');
var path = require('path2/posix');

/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:init', task);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));
    shipit.emit('deploy');
  }
};
