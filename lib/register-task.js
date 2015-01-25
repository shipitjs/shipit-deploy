var Promise = require('bluebird');

module.exports = function registerTask(gruntOrShipit, name, task) {
  if (gruntOrShipit.registerTask) {
    if (Array.isArray(task))
      return gruntOrShipit.registerTask(name, task);

    return gruntOrShipit.registerTask(name, function () {
      var done = this.async();
      var promise = task();

      if (promise)
        promise.nodeify(done);
      else
        done();
    });
  }

  return gruntOrShipit.blTask(name, task);
};
