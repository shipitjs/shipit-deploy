var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path2/posix');
var _ = require('lodash');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'rollback:init', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    _.assign(shipit.constructor.prototype, require('../../lib/releases'));

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
