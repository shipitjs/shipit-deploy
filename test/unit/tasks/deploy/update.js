var sinon = require('sinon');
require('sinon-as-promised');
var moment = require('moment');
var _ = require('lodash');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var updateFactory = require('../../../../tasks/deploy/update');
var Promise = require('bluebird');
var path = require('path2/posix');

var createShipitInstance = function (conf) {
  var shipit = new Shipit({
    environment: 'test',
    log: sinon.stub()
  });

  updateFactory(shipit);

  // Shipit config
  shipit.initConfig({
    test: _.merge({
      workspace: '/tmp/workspace',
      deployTo: '/remote/deploy'
    }, conf)
  });

  shipit.currentPath = path.join(shipit.config.deployTo, 'current');
  shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');

  return shipit;
};

function stubShipit(shipit) {
  sinon.stub(shipit, 'remote').resolves();
  sinon.stub(shipit, 'remoteCopy').resolves();
  sinon.stub(shipit, 'local', function (command) {
    if (command === 'git rev-parse ' + shipit.config.branch) {
      return Promise.resolve(
        {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
      );
    }
  });
  return shipit;
}

function restoreShipit(shipit) {
  shipit.remote.restore();
  shipit.remoteCopy.restore();
  shipit.local.restore();
  return shipit;
}

describe('deploy:update task', function () {
  var shipit, clock;

  beforeEach(function () {
    shipit = createShipitInstance();
    clock = sinon.useFakeTimers(1397730698075);
  });
  afterEach(function () {
    clock.restore();
  });

  describe('update release', function () {
    beforeEach(function () {
      shipit = stubShipit(shipit);
    });
    afterEach(function () {
      shipit = restoreShipit(shipit);
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

    describe('dirToCopy option', function () {
      it('should correct join relative path', function () {
        var paths = [
          {res: '/tmp/workspace/build/', dirToCopy: 'build'},
          {res: '/tmp/workspace/build/', dirToCopy: './build'},
          {res: '/tmp/workspace/build/', dirToCopy: './build/'},
          {res: '/tmp/workspace/build/', dirToCopy: 'build/.'},
          {res: '/tmp/workspace/build/src/', dirToCopy: 'build/src'},
          {res: '/tmp/workspace/build/src/', dirToCopy: 'build/src'}
        ];
        return Promise.all(paths.map(function (path) {
          return new Promise(function (resolve, reject) {
            var shipit = stubShipit(createShipitInstance({
              dirToCopy: path.dirToCopy
            }));
            shipit.start('deploy:update', function (err) {
              if (err) reject(err);
              var dirName = moment.utc().format('YYYYMMDDHHmmss');
              expect(shipit.remoteCopy).to.be.calledWith(path.res, '/remote/deploy/releases/' + dirName);
              clock.tick(5);
              resolve()
            })
          });
        }));
      })
    });

    describe('remoteCopy option', function () {
      it('should accept rsync options', function () {
        return new Promise(function (resolve, reject) {
          var shipit = stubShipit(createShipitInstance({
            deploy: {remoteCopy: {rsync: '--foo'}}
          }));
          shipit.start('deploy:update', function (err) {
            if (err) reject(err);
            var dirName = moment.utc().format('YYYYMMDDHHmmss');
            expect(shipit.remoteCopy).to.be.calledWith('/tmp/workspace/', '/remote/deploy/releases/' + dirName, {rsync: '--foo'});
            clock.tick(5);
            resolve()
          })
        });
      })
    });

  });

  describe('#setPreviousRevision', function () {
    beforeEach(function () {
      shipit = stubShipit(shipit);
    });
    afterEach(function () {
      shipit = restoreShipit(shipit);
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
      shipit = stubShipit(shipit);
    });
    afterEach(function () {
      shipit = restoreShipit(shipit);
    });
    it('should set shipit.previousRelease to null when no previous release', function (done) {
      shipit.start('deploy:update', function (err) {
        if (err) return done(err);
        expect(shipit.previousRelease).to.equal(null);
        done();
      });
    });

    it('should set shipit.previousRelease to (still) current release when one release exist', function (done) {
      shipit.remote.restore();
      sinon.stub(shipit, 'remote', function (command) {
        return Promise.resolve([
          {stdout: '20141704123137\n'}
        ]);
      });
      shipit.start('deploy:update', function (err) {
        if (err) return done(err);
        expect(shipit.previousRelease).to.equal('20141704123137');
        done();
      });
    });
  });

  describe('#copyPreviousRelease', function () {
    beforeEach(function () {
      shipit = stubShipit(shipit);
    });
    afterEach(function () {
      shipit = restoreShipit(shipit);
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
      shipit = stubShipit(shipit);
      shipit.remote.restore();
      sinon.stub(shipit, 'remote', function (command) {
        if (/^if \[ \-f/.test(command)) {
          return Promise.resolve([
            {stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n'}
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
      shipit = restoreShipit(shipit);
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
