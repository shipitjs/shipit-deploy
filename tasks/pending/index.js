var utils = require('shipit-utils');

/**
 * Pending task.
 * - pending:init
 * - pending:log
 */

module.exports = function (gruntOrShipit) {
  require('./log')(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'pending', [
    'pending:log',
  ]);
};
