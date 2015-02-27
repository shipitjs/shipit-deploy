var utils = require('shipit-utils');
var path = require('path2/posix');
var moment = require('moment');
var chalk = require('chalk');

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:update', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);

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
  }
};
