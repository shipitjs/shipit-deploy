var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var chalk = require('chalk');
var path = require('path2/posix');

/**
 * Publish task.
 * - Update synonym link.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:publish', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);

    return updateSynonymLink()
    .then(function () {
      shipit.emit('published');
    });

    /**
     * Update synonym link.
     */

    function updateSynonymLink() {
      shipit.log('Publishing release "%s"', shipit.releasePath);

      shipit.currentPath = path.join(shipit.config.deployTo, 'current');
      var relativeReleasePath = path.join('releases', shipit.releaseDirname);

      return shipit.remote('cd ' + shipit.config.deployTo + ' && ln -nfs ' + relativeReleasePath + ' current')
      .then(function () {
        shipit.log(chalk.green('Release published.'));
      });
    }
  }
};
