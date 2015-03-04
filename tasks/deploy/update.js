var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path2/posix');
var moment = require('moment');
var chalk = require('chalk');
var _ = require('lodash');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:update', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    _.assign(shipit.constructor.prototype, require('../../lib/releases'));

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

    function setPreviousRevision() {
      return shipit.getPreviousReleaseDirname().then(function(previousReleaseDir) {
        var file = path.join(shipit.releasesPath, previousReleaseDir, 'REVISION');
        var revision = false;
        if (previousReleaseDir) {
          return shipit.remote('if [ -f ' + file + ' ]; then cat ' + file + ' 2>/dev/null; fi;').then(function(response) {

            // TODO: How should we handle multiple?
            revision = response[0].stdout.trim();
          });
        }
        shipit.previousRevision = revision;
      });
    }

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
