/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (shipit) {
  // shipit.task('base:deploy:init', task);
  // shipit.task('deploy:init', task);
  shipit.blTask('deploy:init', task);

  function task() {
    shipit.emit('deploy');
  }
};
