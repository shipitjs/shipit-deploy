/**
 * Rollback task.
 * - rollback:init
 * - deploy:publish
 * - deploy:clean
 */

module.exports = function (shipit) {
  require('./init')(shipit);
  require('../deploy/fetch')(shipit);
  require('../deploy/clean')(shipit);

  shipit.task('rollback', [
    'rollback:init',
    'deploy:publish',
    'deploy:clean'
  ]);
};
