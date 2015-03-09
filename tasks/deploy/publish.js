var utils = require('shipit-utils');
var chalk = require('chalk');
var path = require('path2/posix');

/**
 * Publish task.
 * - Update symbolic link.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:publish', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);

    return updateSymbolicLink()
    .then(function () {
      shipit.emit('published');
    });

    /**
     * Update symbolic link.
     */

    function updateSymbolicLink() {
      shipit.log('Publishing release "%s"', shipit.releasePath);

      var relativeReleasePath = path.join('releases', shipit.releaseDirname);

      return shipit.remote('cd ' + shipit.config.deployTo + ' && ln -nfs ' + relativeReleasePath + ' current')
      .then(function () {
        shipit.log(chalk.green('Release published.'));
      });
    }
  }
};
