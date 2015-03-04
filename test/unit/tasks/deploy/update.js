var sinon = require('sinon');
require('sinon-as-promised');
var moment = require('moment');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var updateFactory = require('../../../../tasks/deploy/update');
var Promise = require('bluebird');
var path = require('path');

describe('deploy:update task', function () {
  var shipit, clock;

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    updateFactory(shipit);

    clock = sinon.useFakeTimers(1397730698075);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy'
      }
    });

    sinon.stub(shipit, 'remote').resolves();
    sinon.stub(shipit, 'remoteCopy').resolves();
  });

  afterEach(function () {
    clock.restore();
    shipit.remote.restore();
    shipit.remoteCopy.restore();
  });

  it('should create release path, and do a remote copy', function (done) {
    shipit.start('deploy:update', function (err) {
      if (err) return done(err);
      var dirName = moment.utc().format('YYYYMMDDHHmmss');
      expect(shipit.releaseDirname).to.equal(dirName);
      expect(shipit.releasesPath).to.equal('/remote/deploy/releases');
      expect(shipit.releasePath).to.equal('/remote/deploy/releases/' + dirName);
      expect(shipit.remote).to.be.calledWith('mkdir -p /remote/deploy/releases/' + dirName);
      expect(shipit.remoteCopy).to.be.calledWith('/tmp/workspace/', '/remote/deploy/releases/' + dirName);
      done();
    });

    clock.tick(5);
  });

  describe('#setPreviousRevision', function () {
    describe('no previous revision', function () {
      it('should set shipit.previousRevision to false', function (done) {
        shipit.start('deploy:update', function (err) {
          if (err) return done(err);
          expect(shipit.previousRevision).to.equal(false);
          done();
        });
      });
    });
  });

  describe('#setCurrentRevision', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'local', function (command) {
        if (command === 'git rev-parse ' + shipit.config.branch) {
          return Promise.resolve(
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
          );
        }
      });
    });

    afterEach(function () {
      shipit.local.restore();
    });

    it('should set shipit.currentRevision', function (done) {
      shipit.start('deploy:update', function (err) {
        if (err) return done(err);
        expect(shipit.currentRevision).to.equal('9d63d434a921f496c12854a53cef8d293e2b4756');
        done();
      });
    });
  });

});
