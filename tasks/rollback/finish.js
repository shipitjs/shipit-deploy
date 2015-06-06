var utils = require('shipit-utils');
var init = require('../../lib/init');

/**
 * Update task.
 * - Emit an event "rollbacked".
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'rollback:finish', task);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));

    // Remove rollbacked release if desired
    if(shipit.config.deleteOnRollback){
      var currentReleaseIndex = releases.indexOf(currentRelease);
      var rollbackReleaseIndex = currentReleaseIndex - 1;

      var rollbackDirName = releases[rollbackReleaseIndex];

      if(!rollbackDirName)
        throw new Error ("Cannot find rollback release to delete");

      shipit.log('Deleting release %s.', rollbackDirName);

      var command = "rm -rf " + shipit.releasesPath + "/" + rollbackDirName;
      shipit.remote(command);
      shipit.log('Removed release %s', rollbackDirName);
    }
    shipit.emit('rollbacked');
  }
};
