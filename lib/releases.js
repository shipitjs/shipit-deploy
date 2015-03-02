var path = require('path');
var _ = require('lodash');

module.exports = function releases(shipit) {

  /**
   * Test if all values are equal.
   *
   * @param {*[]} values
   * @returns {boolean}
   */

  var equalValues = function equalValues(values) {
    return values.every(function (value) {
      return _.isEqual(value, values[0]);
    });
  };

  /**
   * Compute the current release dir name.
   *
   * @param {object} result
   * @returns {string}
   */

  var computeReleaseDirname = function computeReleaseDirname(result) {
    if (!result.stdout) return null;

    // Trim last breakline.
    var target = result.stdout.replace(/\n$/, '');

    return target.split(path.sep).pop();
  };

  /**
   * Compute the current release dir name.
   *
   * @param {object} result
   * @returns {string}
   */

  var computeReleases = function computeReleases(result) {
    if (!result.stdout) return null;

    // Trim last breakline.
    var dirs = result.stdout.replace(/\n$/, '');

    // Convert releases to an array.
    return dirs.split('\n');
  };

  /**
   * Return a specified release dirname.
   *
   * @param {int} backFromCurrent Number of releases back, starting from current
   */

  var getPreviousReleaseDirname = function getPreviousReleaseDirname(backFromCurrent) {
    backFromCurrent = parseInt(backFromCurrent || 1, 10);

    return getCurrentReleaseDirname().then(function(currentRelease) {

      if (!currentRelease) {
        return false;
      }

      return getReleases().then(function(releases) {
        var currentReleaseIndex = releases.indexOf(currentRelease);
        var releaseIndex = currentReleaseIndex + backFromCurrent;
        return releaseIndex !== -1 ? releases[releaseIndex] : false;
      });
    });
  };

  /**
   * Return the current release dirname.
   */

  var getCurrentReleaseDirname = function getCurrentReleaseDirname() {
    return shipit.remote('readlink ' + shipit.currentPath)

    .then(function (results) {
      if (!results)
        return shipit.log('No current release found.');

      var releaseDirnames = results.map(computeReleaseDirname);

      if (!equalValues(releaseDirnames))
        throw new Error('Remote server are not synced.');

      return releaseDirnames[0];
    });
  };

  /**
   * Return all remote releases.
   */

  var getReleases = function getReleases(argument) {
    return shipit.remote('ls -r1 ' + shipit.releasesPath)
    .then(function (results) {
      var releases = results.map(computeReleases);

      if (!equalValues(releases))
        throw new Error('Remote server are not synced.');

      return releases[0];
    });
  };


  return _.assign(shipit, {
    getCurrentReleaseDirname: getCurrentReleaseDirname,
    getPreviousReleaseDirname: getPreviousReleaseDirname,
    getReleases: getReleases,
  });
};
