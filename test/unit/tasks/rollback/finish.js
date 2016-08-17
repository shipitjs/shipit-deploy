var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var finishFactory = require('../../../../tasks/rollback/finish');
var path = require('path2/posix');
var Promise = require('bluebird');

describe('rollback:finish task', function () {
  var shipit;
  var readLinkCommand = 'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi';

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    finishFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy',
        deleteOnRollback: false
      }
    });

    shipit.releasePath = '/remote/deploy/releases/20141704123137';
    shipit.releaseDirname = '20141704123137';
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases');

    shipit.rollbackDirName = '20141704123137';
  });

  describe('delete rollbacked release', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote', function (command) {
        if (command === readLinkCommand)
          return Promise.resolve([
            {stdout: '/remote/deploy/releases/20141704123136\n'}
          ]);
        if (command === 'ls -r1 /remote/deploy/releases')
          return Promise.resolve([
            {stdout: '20141704123137\n20141704123136\n'}
          ]);
        if (command === 'rm -rf /remote/deploy/releases/20141704123137')
          return Promise.resolve([]);
      });
      shipit.config.deleteOnRollback = true;
    });

    afterEach(function () {
      shipit.remote.restore();
    });

    it('undefined releases path', function (done) {
      shipit.start('rollback:finish', function (err) {
        expect(err.message).to.equal('Can\'t find release to delete');
        done();
      });
    });

    it('undefined previous directory name', function (done) {
      shipit.prevReleasePath = '/remote/deploy/releases/';
      shipit.start('rollback:finish', function (err) {
        expect(err.message).to.equal('Can\'t find release to delete');
        done();
      });
    });


    it('successful delete', function (done) {
      // set up test specific variables
      shipit.prevReleaseDirname = '20141704123137';
      shipit.prevReleasePath = '/remote/deploy/releases/20141704123137';

      var spy = sinon.spy();
      shipit.on('rollbacked', spy);
      shipit.start('rollback:finish', function (err) {
        if (err)
          return done(err);

        expect(shipit.prevReleaseDirname).to.equal('20141704123137');
        expect(shipit.remote).to.be.calledWith('rm -rf /remote/deploy/releases/20141704123137');
        expect(spy).to.be.called;
        done();
      });
    });
  });


  it('should emit an event', function (done) {
    var spy = sinon.spy();
    shipit.on('rollbacked', spy);
    shipit.start('rollback:finish', function (err) {
      if (err) return done(err);
      expect(spy).to.be.called;
      done();
    });
  });
});
