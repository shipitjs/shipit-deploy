var utils = require('shipit-utils');
var init = require('../../lib/init');
var Promise = require('bluebird');

/**
 * Update task.
 * - Emit an event "rollbacked".
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'rollback:finish', task);

  function task() {

    var shipit = init(utils.getShipit(gruntOrShipit));

    return deleteRelease().then(function(){
      shipit.emit('rollbacked');
    });

    function deleteRelease() {
      // Remove rollbacked release if desired
      if (shipit.config.deleteOnRollback) {
        if(!shipit.prevReleaseDirName || !shipit.prevReleasePath)
          throw new Error("Can't find release to delete");

        var command = "rm -rf " + shipit.prevReleasePath;

        return shipit.remote(command);
      }
      else{
        return Promise.resolve([]);
      }
    }
  }
}
