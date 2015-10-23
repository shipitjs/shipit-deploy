var utils = require('shipit-utils');
var init = require('../../lib/init');

/**
 * Update task.
 * - Emit an event "deployed".
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:finish', task);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));
    shipit.emit('deployed');
  }
};
