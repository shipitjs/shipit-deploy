var path = require('path');
var _ = require('lodash');

var Shipit = module.exports;

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */

function computeReleases(result) {
  if (!result.stdout) return null;

  // Trim last breakline.
  var dirs = result.stdout.replace(/\n$/, '');

  // Convert releases to an array.
  return dirs.split('\n');
}

/**
 * Test if all values are equal.
 *
 * @param {*[]} values
 * @returns {boolean}
 */

function equalValues(values) {
  return values.every(function (value) {
    return _.isEqual(value, values[0]);
  });
}

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */

function computeReleaseDirname(result) {
  if (!result.stdout) return null;

  // Trim last breakline.
  var target = result.stdout.replace(/\n$/, '');

  return target.split(path.sep).pop();
}

/**
 * Return the current release dirname.
 */

Shipit.getCurrentReleaseDirname = function() {
  var shipit = this;

  return shipit.remote('readlink ' + shipit.currentPath)
  .then(function (results) {
    if (!results) {
      shipit.log('No current release found.');
      return null;
    }

    var releaseDirnames = results.map(computeReleaseDirname);

    if (!equalValues(releaseDirnames))
      throw new Error('Remote servers are not synced.');

    return releaseDirnames[0];
  });
};

/**
 * Return a specified release dirname.
 *
 * @param {int} backFromCurrent Number of releases back, starting from current
 */

Shipit.getPreviousReleaseDirname = function(backFromCurrent) {
  var shipit = this;
  backFromCurrent = parseInt(backFromCurrent || 1, 10);

  return shipit.getCurrentReleaseDirname()
  .then(function(currentRelease) {

    if (!currentRelease) {
      return null;
    }

    return shipit.getReleases()
    .then(function(releases) {
      var currentReleaseIndex = releases.indexOf(currentRelease);
      var releaseIndex = currentReleaseIndex + backFromCurrent;
      return releaseIndex !== -1 ? releases[releaseIndex] : null;
    });
  });

};

/**
 * Return all remote releases.
 */

Shipit.getReleases = function() {
  var shipit = this;

  return shipit.remote('ls -r1 ' + shipit.releasesPath)
  .then(function (results) {
    var releases = results.map(computeReleases);

    if (!equalValues(releases))
      throw new Error('Remote servers are not synced.');

    return releases[0];
  });
};

/**
 * Return SHA from remote REVISION file.
 *
 * @param {string} releaseDir Directory name of the relesase dir (YYYYMMDDHHmmss).
 */

Shipit.getRevision = function(releaseDir) {
  var shipit = this;
  var file = path.join(shipit.releasesPath, releaseDir, 'REVISION');

  return shipit.remote('if [ -f ' + file + ' ]; then cat ' + file + ' 2>/dev/null; fi;')
  .then(function(response) {
    return response[0].stdout.trim();
  });
};

Shipit.getPendingCommits = function() {
  var shipit = this;

  return shipit.getCurrentReleaseDirname()
  .then(function(currentReleaseDirname) {
    if (!currentReleaseDirname) {
      return null;
    }
    return shipit.getRevision(currentReleaseDirname)
    .then(function(deployedRevision) {
      if (!deployedRevision) {
        return null;
      }
      return shipit.local('git log --pretty=format:\"' + shipit.config.gitLogFormat + '\" ' + deployedRevision + '..')
      .then(function(response) {
        return response.stdout.trim();
      });
    });
  });
};
