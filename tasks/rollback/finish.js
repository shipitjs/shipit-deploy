var utils = require('shipit-utils');
var init = require('../../lib/init');

/**
 * Update task.
 * - Emit an event "rollbacked".
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'rollback:finish', task);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));
    shipit.emit('rollbacked');
  }
};
