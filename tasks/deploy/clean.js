var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');

/**
 * Clean task.
 * - Remove old releases.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:clean', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);

    return cleanOldReleases()
    .then(function () {
      shipit.emit('cleaned');
    });

    /**
     * Remove old releases.
     */

    function cleanOldReleases() {
      shipit.log('Keeping "%d" last releases, cleaning others', shipit.config.keepReleases);
      var command = '(ls -rd ' + shipit.releasesPath +
      '/*|head -n ' + shipit.config.keepReleases + ';ls -d ' + shipit.releasesPath +
      '/*)|sort|uniq -u|xargs rm -rf';
      return shipit.remote(command);
    }
  }
};
