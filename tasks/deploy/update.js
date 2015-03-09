var utils = require('shipit-utils');
var path = require('path2/posix');
var moment = require('moment');
var chalk = require('chalk');
var _ = require('lodash');

/**
 * Update task.
 * - Set previous revision.
 * - Create and define release path.
 * - Set current revision and write REVISION file.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:update', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);
    _.assign(shipit.constructor.prototype, require('../../lib/shipit'));

    return setPreviousRevision()
    .then(createReleasePath)
    .then(setCurrentRevision)
    .then(remoteCopy)
    .then(function () {
      shipit.emit('updated');
    });

    /**
     * Create and define release path.
     */

    function createReleasePath() {
      shipit.releaseDirname = moment.utc().format('YYYYMMDDHHmmss');
      shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
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
     * Set shipit.previousRevision from remote REVISION file
     */

    function setPreviousRevision() {
      return shipit.getPreviousReleaseDirname().then(function(previousReleaseDir) {
        var previousRevision = null;

        if (previousReleaseDir) {
          return shipit.getRevision(previousReleaseDir).then(function(revision) {
            if (revision) {
              shipit.log(chalk.green('Previous revision found.'));
              previousRevision = revision;
            }
          });
        }

        shipit.previousRevision = previousRevision;
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
