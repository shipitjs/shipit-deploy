module.exports = function (shipit) {
  require('./tasks/deploy')(shipit);
  require('./tasks/rollback')(shipit);
  require('./tasks/pending')(shipit);
};
