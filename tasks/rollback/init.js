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

      return getCurrentReleaseDirname()
      .then(function (currentRelease) {
        if (!currentRelease)
          throw new Error('Cannot find current release dirname.');

        shipit.log('Current release dirname : %s.', currentRelease);

        shipit.log('Getting dist releases.');

        return getReleases()
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

      /**
       * Return the current release dirname.
       */

      function getCurrentReleaseDirname() {
        return shipit.remote('readlink ' + shipit.currentPath)
        .then(function (results) {
          var releaseDirnames = results.map(computeReleaseDirname);

          if (!equalValues(releaseDirnames))
            throw new Error('Remote server are not synced.');

          return releaseDirnames[0];
        });
      }

      /**
       * Compute the current release dir name.
       *
       * @param {object} result
       * @returns {string}
       */

      function computeReleaseDirname(result) {
        if (!result.stdout) return null;

        // Trim last breakline.
        var target = result.stdout.replace(/\n$/, '');

        return target.split(path.sep).pop();
      }


      /**
       * Return all remote releases.
       */

      function getReleases() {
        return shipit.remote('ls -r1 ' + shipit.releasesPath)
        .then(function (results) {
          var releases = results.map(computeReleases);

          if (!equalValues(releases))
            throw new Error('Remote server are not synced.');

          return releases[0];
        });
      }

      /**
       * Compute the current release dir name.
       *
       * @param {object} result
       * @returns {string}
       */

      function computeReleases(result) {
        if (!result.stdout) return null;

        // Trim last breakline.
        var dirs = result.stdout.replace(/\n$/, '');

        // Convert releases to an array.
        return dirs.split('\n');
      }

      /**
       * Test if all values are equal.
       *
       * @param {*[]} values
       * @returns {boolean}
       */

      function equalValues(values) {
        return values.every(function (value) {
          return _.isEqual(value, values[0]);
        });
      }
    }
  }
};
