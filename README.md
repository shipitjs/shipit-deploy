# shipit-deploy

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shipitjs/shipit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/shipitjs/shipit-deploy.svg?branch=master)](https://travis-ci.org/shipitjs/shipit-deploy)
[![Dependency Status](https://david-dm.org/shipitjs/shipit-deploy.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit-deploy)
[![devDependency Status](https://david-dm.org/shipitjs/shipit-deploy/dev-status.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit-deploy#info=devDependencies)

Set of deployment tasks for [Shipit](https://github.com/shipitjs/shipit) based on git and rsync commands.

**Features:**

- Deploy tag, branch or commit
- Add additional behaviour using hooks
- Build your project locally or remotely
- Easy rollback

## Install

```
npm install shipit-deploy
```

## Usage

### Example `shipitfile.js`

```js
module.exports = function (shipit) {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/tmp/deploy_to',
      currentPath: 'mycurrentpath',
      releasesPath: 'myreleasespath',
      repositoryUrl: 'https://github.com/user/repo.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 2,
      deleteOnRollback: false,
      key: '/path/to/key',
      shallowClone: true
    },
    staging: {
      servers: 'user@myserver.com:port'
    }
  });
};
```

To deploy on staging, you must use the following command :

```
shipit staging deploy
```

You can rollback to the previous releases with the command :

```
shipit staging rollback
```

## Options

### workspace

Type: `String`

Define a path to an empty directory where Shipit builds it's syncing source. **Beware to not set this path to the root of your repository as shipit-deploy cleans the directory at the given path as a first step.**

### dirToCopy

Type: `String`
Default: same as workspace

Define directory within the workspace which should be deployed.

### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releasesPath` is automatically created. A symlink `currentPath` is linked to the current release.

### currentPath

Type: `String`
Optional: default is `current`

Define the document root where the project will be deployed.

### releasesPath

Type: `String`
Optional: default is `releases`

Define the repository where the releases are stored.

### repositoryUrl

Type: `String`

Git URL of the project repository.

### branch

Type: `String`

Tag, branch or commit to deploy.

### ignores

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

### deleteOnRollback

Type: `Boolean`

Whether or not to delete the old release when rolling back to a previous release.

### keepReleases

Type: `Number`

Number of releases to keep on the remote server.

### shallowClone

Type: `Boolean`

Perform a shallow clone. Default: `false`.

### gitLogFormat

Type: `String`

Log format to pass to [`git log`](http://git-scm.com/docs/git-log#_pretty_formats). Used to display revision diffs in `pending` task. Default: `%h: %s - %an`.

## Variables

Several variables are attached during the deploy and the rollback process:

### shipit.config.*

All options described in the config sections are available in the `shipit.config` object.

### shipit.repository

Attached during `deploy:fetch` task.

You can manipulate the repository using git command, the API is describe in [gift](https://github.com/sentientwaffle/gift).

### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "YYYYMMDDHHmmss" (moment format).

### shipit.releasesPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The remote releases path.

### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

### shipit.currentPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The current symlink path : `path.join(shipit.config.deployTo, shipit.config.currentPath)`.

## Workflow tasks

- deploy
  - deploy:init
    - Emit event "deploy".
  - deploy:fetch
    - Create workspace.
    - Initialize repository.
    - Add remote.
    - Fetch repository.
    - Checkout commit-ish.
    - Merge remote branch in local branch.
    - Emit event "fetched".
  - deploy:update
    - Create and define release path.
    - Remote copy project.
    - Emit event "updated".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
  - deploy:finish
    - Emit event "deployed".
- rollback
  - rollback:init
    - Define release path.
    - Emit event "rollback".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
  - rollback:finish
    - Emit event "rollbacked".
- pending
  - pending:log
    - Log pending commits (diff between HEAD and currently deployed revision) to console.

## Dependencies

### Local

- git 1.7.8+
- rsync 3+
- OpenSSH 5+

### Remote

- GNU coreutils 5+

## License

MIT