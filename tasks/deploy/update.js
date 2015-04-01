var utils = require('shipit-utils');
var path = require('path2/posix');
var moment = require('moment');
var chalk = require('chalk');
var _ = require('lodash');
var util = require('util');
var Promise = require('bluebird');

/**
 * Update task.
 * - Set previous release.
 * - Set previous revision.
 * - Create and define release path.
 * - Copy previous release (for faster rsync)
 * - Set current revision and write REVISION file.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:update', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);
    _.assign(shipit.constructor.prototype, require('../../lib/shipit'));

    return setPreviousRelease()
    .then(setPreviousRevision)
    .then(createReleasePath)
    .then(copyPreviousRelease)
    .then(setCurrentRevision)
    .then(remoteCopy)
    .then(function () {
      shipit.emit('updated');
    });

    /**
     * Copy previous release to release dir.
     */

    function copyPreviousRelease() {
      if (!shipit.previousRelease) {
        return Promise.resolve();
      }
      return shipit.remote(util.format('cp -R %s %s', path.join(shipit.releasesPath, shipit.previousRelease), shipit.releasePath));
    }

    /**
     * Create and define release path.
     */

    function createReleasePath() {
      shipit.releaseDirname = moment.utc().format('YYYYMMDDHHmmss');
      shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname);

      shipit.log('Create release path "%s"', shipit.releasePath);
      return shipit.remote('mkdir -p ' + shipit.releasePath)
      .then(function () {
        shipit.log(chalk.green('Release path created.'));
      });
    }

    /**
     * Remote copy project.
     */

    function remoteCopy() {
      shipit.log('Copy project to remote servers.');

      return shipit.remoteCopy(shipit.config.workspace + '/', shipit.releasePath)
      .then(function () {
        shipit.log(chalk.green('Finished copy.'));
      });
    }

    /**
     * Set shipit.previousRevision from remote REVISION file.
     */

    function setPreviousRevision() {
      shipit.previousRevision = null;

      if (!shipit.previousRelease) {
        return Promise.resolve();
      }

      return shipit.getRevision(shipit.previousRelease)
      .then(function(revision) {

        if (revision) {
          shipit.log(chalk.green('Previous revision found.'));
          shipit.previousRevision = revision;
        }
      });
    }

    /**
     * Set shipit.previousRelease.
     */

    function setPreviousRelease() {
      shipit.previousRelease = null;
      return shipit.getPreviousReleaseDirname()
      .then(function(previousReleaseDir) {
        if (previousReleaseDir) {
          shipit.log(chalk.green('Previous release found.'));
          shipit.previousRelease = previousReleaseDir;
        }
      });
    }

    /**
     * Set shipit.currentRevision and write it to REVISION file.
     */

    function setCurrentRevision() {
      shipit.log('Setting current revision and creating revision file.');

      return shipit.local('git rev-parse ' + shipit.config.branch).then(function(response) {
        shipit.currentRevision = response.stdout.trim();
        return shipit.remote('echo "' + shipit.currentRevision + '" > ' + path.join(shipit.releasePath, 'REVISION'));
      }).then(function() {
        shipit.log(chalk.green('Revision file created.'));
      });
    }
  }
};
