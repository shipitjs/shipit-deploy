/**
 * Deploy task.
 * - deploy:fetch
 * - deploy:update
 * - deploy:publish
 * - deploy:clean
 */

module.exports = function (shipit) {
  require('./init')(shipit);
  require('./fetch')(shipit);
  require('./update')(shipit);
  require('./publish')(shipit);
  require('./clean')(shipit);

  shipit.task('deploy', [
    'deploy:init',
    'deploy:fetch',
    'deploy:update',
    'deploy:publish',
    'deploy:clean'
  ]);
};
