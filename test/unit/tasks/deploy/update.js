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

    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');
  });

  afterEach(function () {
    clock.restore();
  });

  describe('update release', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote').resolves();
      sinon.stub(shipit, 'remoteCopy').resolves();
      sinon.stub(shipit, 'local', function (command) {
        if (command === 'git rev-parse ' + shipit.config.branch) {
          return Promise.resolve(
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
          );
        }
      });
    });

    afterEach(function () {
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
  });

  describe('#setPreviousRevision', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote').resolves();
      sinon.stub(shipit, 'remoteCopy').resolves();
      sinon.stub(shipit, 'local', function (command) {
        if (command === 'git rev-parse ' + shipit.config.branch) {
          return Promise.resolve(
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
          );
        }
      });
    });
    afterEach(function () {
      shipit.remote.restore();
      shipit.remoteCopy.restore();
    });
    describe('no previous revision', function () {
      it('should set shipit.previousRevision to null', function (done) {
        shipit.start('deploy:update', function (err) {
          if (err) return done(err);
          expect(shipit.previousRevision).to.equal(null);
          expect(shipit.local).to.be.calledWith('git rev-parse ' + shipit.config.branch, {cwd: '/tmp/workspace'});
          done();
        });
      });
    });
  });

  describe('#setPreviousRelease', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote').resolves();
      sinon.stub(shipit, 'remoteCopy').resolves();
      sinon.stub(shipit, 'local', function (command) {
        if (command === 'git rev-parse ' + shipit.config.branch) {
          return Promise.resolve(
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
          );
        }
      });
    });
    afterEach(function () {
      shipit.remote.restore();
      shipit.remoteCopy.restore();
    });
    describe('no previous release', function () {
      it('should set shipit.previousRelease to null', function (done) {
        shipit.start('deploy:update', function (err) {
          if (err) return done(err);
          expect(shipit.previousRelease).to.equal(null);
          done();
        });
      });
    });
  });

  describe('#copyPreviousRelease', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote').resolves();
      sinon.stub(shipit, 'remoteCopy').resolves();
      sinon.stub(shipit, 'local', function (command) {
        if (command === 'git rev-parse ' + shipit.config.branch) {
          return Promise.resolve(
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
          );
        }
      });
    });
    afterEach(function () {
      shipit.remote.restore();
      shipit.remoteCopy.restore();
    });
    describe('no previous release', function () {
      it('should proceed with rsync', function (done) {
        shipit.start('deploy:update', function (err) {
          if (err) return done(err);
          expect(shipit.previousRelease).to.equal(null);
          done();
        });
      });
    });
  });

  describe('#setCurrentRevision', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remoteCopy').resolves();
      sinon.stub(shipit, 'local', function (command) {
        if (command === 'git rev-parse ' + shipit.config.branch) {
          return Promise.resolve(
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
          );
        }
      });

      sinon.stub(shipit, 'remote', function (command) {
        var file = '/remote/deploy/releases/20141704123137/REVISION';
        if (/^if \[ \-f/.test(command)) {
          return Promise.resolve([
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'},
          ]);
        }

        if (command === 'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi') {
          return Promise.resolve([
            {stdout: '/remote/deploy/releases/20141704123137'}
          ]);
        }

        if (command === 'ls -r1 /remote/deploy/releases') {
          return Promise.resolve([
            {stdout: '20141704123137\n20141704123133\n'},
            {stdout: '20141704123137\n20141704123133\n'}
          ]);
        }

        if(/^cp/.test(command)) {
          var args = command.split(' ');
          if(/\/.$/.test(args[args.length-2]) === false) {
            return Promise.reject(new Error("Copy folder contents, not the folder itself"));
          }
        }

        return Promise.resolve([{stdout: ''}]);
      });
    });

    afterEach(function () {
      shipit.local.restore();
      shipit.remote.restore();
      shipit.remoteCopy.restore();
    });

    it('should set shipit.currentRevision', function (done) {
      shipit.start('deploy:update', function (err) {
        if (err) return done(err);
        expect(shipit.currentRevision).to.equal('9d63d434a921f496c12854a53cef8d293e2b4756');
        done();
      });
    });

    it('should update remote REVISION file', function (done) {
      shipit.start('deploy:update', function (err) {
        if (err) return done(err);
        shipit.getRevision('20141704123137')
        .then(function(revision) {
          expect(revision).to.equal('9d63d434a921f496c12854a53cef8d293e2b4756');
          done();
        });
      });
    });

    it('should copy contents of previous release into new folder', function (done) {
      shipit.start('deploy:update', function (err) {
        if(err) { return done(err); }
        expect(shipit.previousRelease).not.to.equal(null);
        done();
      });
    });

  });
});
