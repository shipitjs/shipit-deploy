var sinon = require('sinon');
require('sinon-as-promised');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var cleanFactory = require('../../../../tasks/deploy/clean');

describe('deploy:clean task', function () {
  var shipit;

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });
    cleanFactory(shipit);

    // Shipit config.
    shipit.initConfig({
      test: {
        keepReleases: 5
      }
    });

    shipit.releasesPath = '/remote/deploy/releases';

    sinon.stub(shipit, 'remote').resolves();
  });

  afterEach(function () {
    shipit.remote.restore();
  });

  it('should remove old releases', function (done) {
    shipit.start('deploy:clean', function (err) {
      if (err) return done(err);
      expect(shipit.remote).to.be.calledWith('(ls -rd /remote/deploy/releases/*|head -n 5;ls -d ' +
        shipit.releasesPath + '/*)|sort|uniq -u|' +
        'xargs rm -rf');
      done();
    });
  });
});
