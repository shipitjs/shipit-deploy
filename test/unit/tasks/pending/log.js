var sinon = require('sinon');
require('sinon-as-promised');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var pendingFactory = require('../../../../tasks/pending/log');
var path = require('path2/posix');

describe('pending:log task', function () {
  var shipit;

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    pendingFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy',
        releasesPath: 'releases'
      }
    });

    shipit.releasePath = '/remote/deploy/' + shipit.config.releasesPath+ '/20141704123138';
    shipit.releaseDirname = '20141704123138';

    sinon.stub(shipit, 'remote').resolves();
  });

  afterEach(function () {
    shipit.remote.restore();
  });

  describe('#getPendingCommits', function () {
    describe('no current release', function () {
      it('should return null', function (done) {
        shipit.start('pending:log', function (err) {
          if (err) return done(err);
          shipit.getPendingCommits()
          .then(function(commitStr) {
            expect(commitStr).to.equal(null);
            done();
          });
        });
      });
    });
  });
});
