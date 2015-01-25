var registerTask = require('../../lib/register-task');

/**
 * Rollback task.
 * - rollback:init
 * - deploy:publish
 * - deploy:clean
 */

module.exports = function (gruntOrShipit) {
  require('./init')(gruntOrShipit);
  require('../deploy/fetch')(gruntOrShipit);
  require('../deploy/clean')(gruntOrShipit);

  registerTask(gruntOrShipit, 'rollback', [
    'rollback:init',
    'deploy:publish',
    'deploy:clean'
  ]);
};
