var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');

/**
 * Log task.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'pending:log', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
    shipit.config.gitLogFormat = shipit.config.gitLogFormat || '%h: %s - %an';
    _.assign(shipit.constructor.prototype, require('../../lib/shipit'));

    return shipit.getPendingCommits()
    .then(function(response) {
      var msg = chalk.green('\nNo pending commits.');
      response = (response !== null && response.stdout) ? response.stdout.trim(): response;

      if (response) {
        msg = chalk.yellow(chalk.underline('\nPending commits:\n') + response);
      }

      shipit.log(msg);
    });
  }
};
