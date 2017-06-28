var utils = require('shipit-utils');
var chalk = require('chalk');
var path = require('path2/posix');

/**
 * Publish task.
 * - Update symbolic link.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:publish', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);

    return updateSymbolicLink()
    .then(function () {
      shipit.emit('published');
    });

    /**
     * Update symbolic link.
     */

    function updateSymbolicLink() {
      shipit.log('Publishing release "%s"', shipit.releasePath);

      var relativeReleasePath = path.join('releases', shipit.releaseDirname);

      return shipit.remote(
        'cd ' + shipit.config.deployTo + ' && ' +
        'if [[ -d current && ! (-L current) ]]; then ' +
        'echo \"ERR: could not make symlink\"; ' +
        'else ' +
        'ln -nfs ' + relativeReleasePath + ' current_tmp && ' +
        'mv -fT current_tmp current; ' +
        'fi'
      )
      .then(function (res) {
        var failedresult = (res && res.stdout) ? res.stdout.filter(function(r) {
          return r.indexOf('could not make symlink') > -1;
        }) : [];
        if(failedresult.length && failedresult.length > 0) {
          shipit.log(chalk.yellow('Symbolic link at remote not made, as something already exists at ' + path(shipit.config.deployTo, 'current')));
        }

        shipit.log(chalk.green('Release published.'));
      });
    }
  }
};
