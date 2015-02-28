var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path2/posix');
var moment = require('moment');
var chalk = require('chalk');
var util = require('util');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'deploy:update', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);

    return createReleasePath()
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
      function mkdir() {
        return shipit.remote('mkdir -p ' + shipit.releasePath);
      }

      var returnedPromise;
      if (shipit.config.copyReleaseBeforeUpdate) {
        returnedPromise = shipit.remote(util.format('set -o pipefail && ' +
        'ls -rd %s/*|head -n 1 | xargs -I folder cp -R folder %s', shipit.releasesPath, shipit.releasePath))
            .then(function () {
              shipit.log('Release copied from previous release');
            }).catch(function () {
              return mkdir();
            });
      } else
        returnedPromise = mkdir();

      return returnedPromise.then(function () {
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
  }
};
