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

      if ( shipit.config.releasesPath == undefined )
        shipit.config.releasesPath = 'releases';

      if ( shipit.config.currentPath == undefined )
        shipit.config.currentPath = 'current';

      var relativeReleasePath = path.join(shipit.config.releasesPath, shipit.releaseDirname);

      return shipit.remote('cd ' + shipit.config.deployTo + ' && ln -nfs ' + relativeReleasePath + ' ' + shipit.config.currentPath + '')
      .then(function () {
        shipit.log(chalk.green('Release published.'));
      });
    }
  }
};
