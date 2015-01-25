/**
 * Init task.
 * - Emit deploy event.
 */

module.exports = function (shipit) {
  shipit.blTask('deploy:init', task);

  function task() {
    shipit.emit('deploy');
  }
};
