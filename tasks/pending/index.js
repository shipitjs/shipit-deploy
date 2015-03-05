var registerTask = require('../../lib/register-task');

/**
 * Pending task.
 * - pending:init
 * - pending:log
 */

module.exports = function (gruntOrShipit) {
  require('./init')(gruntOrShipit);
  require('./log')(gruntOrShipit);

  registerTask(gruntOrShipit, 'pending', [
    'pending:init',
    'pending:log',
  ]);
};
