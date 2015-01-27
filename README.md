# shipit-deploy

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/shipitjs/shipit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
      repositoryUrl: 'https://github.com/user/repo.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 2,
      key: '/path/to/key',
      shallowClone: true
    },
    staging: {
      servers: 'user@myserver.com'
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

Define the local working path of the project deployed.

### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releases` is automatically created. A symlink `current` is linked to the current release.

### repositoryUrl

Type: `String`

Git URL of the project repository.

### branch

Type: `String`

Tag, branch or commit to deploy.

### ignores

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

### keepReleases

Type: `String`

Number of release to keep on the remote server.

### shallowClone

Type: `Boolean`

Perform a shallow clone. Default: `false`.

## Variables

Several variables are attached during the deploy and the rollback process:

### shipit.config.*

All options describe in the config sections are avalaible in the `shipit.config` object.

### shipit.repository

Attached during `deploy:fetch` task.

You can manipulate the repository using git command, the API is describe in [gift](https://github.com/sentientwaffle/gift).

### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "YYYYMMDDHHmmss" (moment format).

### shipit.releasesPath

Attached during `deploy:update` and `rollback:init` task.

The remote releases path.

### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

### shipit.currentPath

Attached during `deploy:publish` and `rollback:init` task.

The current symlink path : `path.join(shipit.config.deployTo, 'current')`.

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

## Dependencies

### Local

- git 1.7.8+
- rsync 3+
- OpenSSH 5+

### Remote

- GNU coreutils 5+

## License

MIT
