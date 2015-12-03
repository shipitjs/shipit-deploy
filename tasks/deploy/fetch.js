var utils = require('shipit-utils');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var Promise = require('bluebird');

/**
 * Fetch task.
 * - Create workspace.
 * - Fetch repository.
 * - Checkout commit-ish.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'deploy:fetch', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);

    return createWorkspace()
    .then(initRepository)
    .then(addRemote)
    .then(fetch)
    .then(checkout)
    .then(reset)
    .then(merge)
    .then(function () {
      shipit.emit('fetched');
    });

    /**
     * Create workspace.
     */

    function createWorkspace() {
      function create() {
        shipit.log('Create workspace "%s"', shipit.config.workspace);
        return Promise.promisify(mkdirp)(shipit.config.workspace)
        .then(function () {
          shipit.log(chalk.green('Workspace created.'));
        });
      }

      if (shipit.config.shallowClone) {
        shipit.log('Deleting existing workspace "%s"', shipit.config.workspace);
        return shipit.local('rm -rf ' + shipit.config.workspace)
        .then(create);
      }

      return create();
    }

    /**
     * Initialize repository.
     */

    function initRepository() {
      shipit.log('Initialize local repository in "%s"', shipit.config.workspace);
      return shipit.local('git init', {cwd: shipit.config.workspace})
      .then(function () {
        shipit.log(chalk.green('Repository initialized.'));
      });
    }

    /**
     * Add remote.
     */

    function addRemote() {
      shipit.log('List local remotes.');

      // List remotes.
      return shipit.local('git remote', {cwd: shipit.config.workspace})
      .then(function (res) {
        var remotes = res.stdout ? res.stdout.split(/\s/) : [];
        var method = remotes.indexOf('shipit') !== -1 ? 'set-url' : 'add';

        shipit.log('Update remote "%s" to local repository "%s"',
          shipit.config.repositoryUrl, shipit.config.workspace);

        // Update remote.
        return shipit.local(
          'git remote ' + method + ' shipit ' + shipit.config.repositoryUrl,
          {cwd: shipit.config.workspace}
        );
      })
      .then(function () {
        shipit.log(chalk.green('Remote updated.'));
      });
    }

    /**
     * Fetch repository.
     */

    function fetch() {
      var fetchCommand = 'git fetch' +
        (shipit.config.shallowClone ? ' --depth=1 ' : ' ') +
        'shipit -p --tags';

      shipit.log('Fetching repository "%s"', shipit.config.repositoryUrl);

      return shipit.local(
        fetchCommand,
        {cwd: shipit.config.workspace}
      )
      .then(function () {
        shipit.log(chalk.green('Repository fetched.'));
      });
    }

    /**
     * Checkout commit-ish.
     */

    function checkout() {
      shipit.log('Checking out commit-ish "%s"', shipit.config.branch);
      return shipit.local(
        'git checkout ' + shipit.config.branch,
        {cwd: shipit.config.workspace}
      )
      .then(function () {
        shipit.log(chalk.green('Checked out.'));
      });
    }

    /**
     * Hard reset of working tree.
     */

    function reset() {
      shipit.log('Resetting the working tree');
      return shipit.local(
        'git reset --hard HEAD',
        {cwd: shipit.config.workspace}
      )
      .then(function () {
        shipit.log(chalk.green('Reset working tree.'));
      });
    }

    /**
     * Merge branch.
     */

    function merge() {
      shipit.log('Testing if commit-ish is a branch.');

      // Test if commit-ish is a branch.
      return shipit.local(
        'git branch --list ' + shipit.config.branch,
        {cwd: shipit.config.workspace}
      )
      .then(function (res) {
        var isBranch = !!res.stdout;

        if (!isBranch) {
          shipit.log(chalk.green('No branch, no merge.'));
          return;
        }

        shipit.log('Commit-ish is a branch, merging...');

        // Merge branch.
        return shipit.local(
          'git merge shipit/' + shipit.config.branch,
          {cwd: shipit.config.workspace}
        );
      })
      .then(function () {
        shipit.log(chalk.green('Branch merged.'));
      });
    }
  }
};
