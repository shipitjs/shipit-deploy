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
    .then(remoteCopy)
    .then(setCurrentRevision)
    .then(function () {
      shipit.emit('updated');
    });

    /**
     * Copy previous release to release dir.
     */

    function copyPreviousRelease() {
      var copyParameter = shipit.config.copy || '-a';
      if (!shipit.previousRelease) {
        return Promise.resolve();
      }
      shipit.log('Copy previous release to "%s"', shipit.releasePath);
      return shipit.remote(util.format('cp %s %s/. %s', copyParameter, path.join(shipit.releasesPath, shipit.previousRelease), shipit.releasePath));
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
      var options = _.get(shipit.config, 'deploy.remoteCopy') || {rsync: '--del'};
      var rsyncFrom = shipit.config.rsyncFrom || shipit.config.workspace;
      var uploadDirPath = path.resolve(rsyncFrom, shipit.config.dirToCopy || '');

      shipit.log('Copy project to remote servers.');

      return shipit.remoteCopy(uploadDirPath + '/', shipit.releasePath, options)
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
      return shipit.getCurrentReleaseDirname()
      .then(function(currentReleasseDirname) {
        if (currentReleasseDirname) {
          shipit.log(chalk.green('Previous release found.'));
          shipit.previousRelease = currentReleasseDirname;
        }
      });
    }

    /**
     * Set shipit.currentRevision and write it to REVISION file.
     */

    function setCurrentRevision() {
      shipit.log('Setting current revision and creating revision file.');

      return shipit.local('git rev-parse ' + shipit.config.branch, {cwd: shipit.config.workspace}).then(function(response) {
        shipit.currentRevision = response.stdout.trim();
        return shipit.remote('echo "' + shipit.currentRevision + '" > ' + path.join(shipit.releasePath, 'REVISION'));
      }).then(function() {
        shipit.log(chalk.green('Revision file created.'));
      });
    }
  }
};
