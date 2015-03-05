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
    _.assign(shipit.constructor.prototype, require('../../lib/shipit'));

    return shipit.getPendingCommits()
    .then(function(response) {
      var msg = chalk.green('\nNo pending commits.');

      if (response.stdout) {
        msg = chalk.yellow(chalk.underline('\nPending commits:\n') + response.stdout);
      }

      shipit.log(msg);
    });
  }
};
