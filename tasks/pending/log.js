var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var init = require('../../lib/init');
var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');

/**
 * Log task.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'pending:log', task);

  function task() {
    var shipit = init(getShipit(gruntOrShipit));
    return shipit.getPendingCommits()
    .then(function(commits) {
      var msg = chalk.green('\nNo pending commits.');

      if (commits) {
        msg = chalk.yellow(chalk.underline('\nPending commits:\n') + commits);
      }

      shipit.log(msg);
    });
  }
};
