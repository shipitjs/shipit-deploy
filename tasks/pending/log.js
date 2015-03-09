var utils = require('shipit-utils');
var init = require('../../lib/init');
var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');

/**
 * Log task.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'pending:log', task);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));
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
