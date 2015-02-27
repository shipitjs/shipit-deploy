var utils = require('shipit-utils');

/**
 * Deploy task.
 * - deploy:fetch
 * - deploy:update
 * - deploy:publish
 * - deploy:clean
 */

module.exports = function (gruntOrShipit) {
  require('./init')(gruntOrShipit);
  require('./fetch')(gruntOrShipit);
  require('./update')(gruntOrShipit);
  require('./publish')(gruntOrShipit);
  require('./clean')(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'deploy', [
    'deploy:init',
    'deploy:fetch',
    'deploy:update',
    'deploy:publish',
    'deploy:clean'
  ]);
};
