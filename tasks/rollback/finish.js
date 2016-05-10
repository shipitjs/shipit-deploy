var Promise = require('bluebird');
var utils = require('shipit-utils');
var init = require('../../lib/init');

/**
 * Update task.
 * - Emit an event "rollbacked".
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'rollback:finish', function () {
    var shipit = init(utils.getShipit(gruntOrShipit));

    function deleteRelease() {
      if (!shipit.config.deleteOnRollback)
        return Promise.resolve([]);

      if (!shipit.prevReleaseDirname || !shipit.prevReleasePath)
        return Promise.reject(new Error('Can\'t find release to delete'));

      var command = 'rm -rf ' + shipit.prevReleasePath;
      return shipit.remote(command);
    }

    return deleteRelease().then(function () {
      shipit.emit('rollbacked');
    });
  });
};
