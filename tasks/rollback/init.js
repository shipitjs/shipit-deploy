var utils = require('shipit-utils');
var init = require('../../lib/init');
var path = require('path2/posix');
var _ = require('lodash');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'rollback:init', task, false);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));

    return defineReleasePath()
    .then(function () {
      shipit.emit('rollback');
    });

    /**
     * Define release path to rollback.
     */

    function defineReleasePath() {
      shipit.currentPath = path.join(shipit.config.deployTo, 'current');
      shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');

      shipit.log('Get current release dirname.');

      return shipit.getCurrentReleaseDirname()
      .then(function (currentRelease) {
        if (!currentRelease)
          throw new Error('Cannot find current release dirname.');

        shipit.log('Current release dirname : %s.', currentRelease);

        shipit.log('Getting dist releases.');

        return shipit.getReleases()
        .then(function (releases) {
          if (!releases)
            throw new Error('Cannot read releases.');

          shipit.log('Dist releases : %j.', releases);

          var currentReleaseIndex = releases.indexOf(currentRelease);
          var rollbackReleaseIndex = currentReleaseIndex + 1;

          shipit.releaseDirname = releases[rollbackReleaseIndex];

          shipit.log('Will rollback to %s.', shipit.releaseDirname);

          if (!shipit.releaseDirname)
            throw new Error('Cannot rollback, release not found.');

          shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname);
        });
      });
    }
  }
};
