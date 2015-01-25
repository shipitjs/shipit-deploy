/**
 * Module dependencies.
 */

var chalk = require('chalk');
var path = require('path2/posix');

/**
 * Publish task.
 * - Update synonym link.
 */

module.exports = function (shipit) {
  shipit.blTask('deploy:publish', task);

  function task() {
    return updateSynonymLink()
    .then(function () {
      shipit.emit('published');
    });

    /**
     * Update synonym link.
     */

    function updateSynonymLink() {
      shipit.log('Publishing release "%s"', shipit.releasePath);

      shipit.currentPath = path.join(shipit.config.deployTo, 'current');
      var relativeReleasePath = path.join('releases', shipit.releaseDirname);

      return shipit.remote('cd ' + shipit.config.deployTo + ' && ln -nfs ' + relativeReleasePath + ' current')
      .then(function () {
        shipit.log(chalk.green('Release published.'));
      });
    }
  }
};
