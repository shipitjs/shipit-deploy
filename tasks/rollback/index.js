var utils = require('shipit-utils');

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
  require('./finish')(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'rollback', [
    'rollback:init',
    'deploy:publish',
    'deploy:clean',
    'rollback:finish'
  ]);
};
