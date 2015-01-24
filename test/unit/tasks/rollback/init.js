var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var initFactory = require('../../../../tasks/rollback/init');
var Promise = require('bluebird');

describe('rollback:init task', function () {
  var shipit;

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    initFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy'
      }
    });
  });

  describe('#getCurrentReleaseDirName', function () {
    describe('unsync server', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command) {
          if (command === 'readlink /remote/deploy/current')
            return Promise.resolve([
              {stdout: '/remote/deploy/releases/20141704123138'},
              {stdout: '/remote/deploy/releases/20141704123137'}
            ]);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        shipit.start('rollback:init', function (err) {
          expect(err.message).to.equal('Remote server are not synced.');
          done();
        });
      });
    });

    describe('bad release dirname', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command) {
          if (command === 'readlink /remote/deploy/current')
            return Promise.resolve([]);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        shipit.start('rollback:init', function (err) {
          expect(err.message).to.equal('Cannot find current release dirname.');
          done();
        });
      });
    });
  });

  describe('#getReleases', function () {
    describe('unsync server', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command) {
          if (command === 'readlink /remote/deploy/current')
            return Promise.resolve([
              {stdout: '/remote/deploy/releases/20141704123137'}
            ]);
          if (command === 'ls -r1 /remote/deploy/releases')
            return Promise.resolve([
              {stdout: '20141704123137\n20141704123134\n'},
              {stdout: '20141704123137\n20141704123133\n'}
            ]);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        shipit.start('rollback:init', function (err) {
          expect(err.message).to.equal('Remote server are not synced.');
          done();
        });
      });
    });

    describe('bad releases', function () {
      beforeEach(function () {
        sinon.stub(shipit, 'remote', function (command) {
          if (command === 'readlink /remote/deploy/current')
            return Promise.resolve([
              {stdout: '/remote/deploy/releases/20141704123137'}
            ]);
          if (command === 'ls -r1 /remote/deploy/releases')
            return Promise.resolve([]);
        });
      });

      afterEach(function () {
        shipit.remote.restore();
      });

      it('should return an error', function (done) {
        shipit.start('rollback:init', function (err) {
          expect(err.message).to.equal('Cannot read releases.');
          done();
        });
      });
    });
  });

  describe('release not exists', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote', function (command) {
        if (command === 'readlink /remote/deploy/current')
          return Promise.resolve([
            {stdout: '/remote/deploy/releases/20141704123137'}
          ]);
        if (command === 'ls -r1 /remote/deploy/releases')
          return Promise.resolve([
            {stdout: '20141704123137'}
          ]);
      });
    });

    afterEach(function () {
      shipit.remote.restore();
    });

    it('should return an error', function (done) {
      shipit.start('rollback:init', function (err) {
        expect(err.message).to.equal('Cannot rollback, release not found.');
        done();
      });
    });
  });

  describe('all good', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'remote', function (command) {
        if (command === 'readlink /remote/deploy/current')
          return Promise.resolve([
            {stdout: '/remote/deploy/releases/20141704123137\n'}
          ]);
        if (command === 'ls -r1 /remote/deploy/releases')
          return Promise.resolve([
            {stdout: '20141704123137\n20141704123136\n'}
          ]);
      });
    });

    afterEach(function () {
      shipit.remote.restore();
    });

    it('define path', function (done) {
      shipit.start('rollback:init', function (err) {
        if (err) return done(err);
        expect(shipit.currentPath).to.equal('/remote/deploy/current');
        expect(shipit.releasesPath).to.equal('/remote/deploy/releases');
        expect(shipit.remote).to.be.calledWith('readlink /remote/deploy/current');
        expect(shipit.remote).to.be.calledWith('ls -r1 /remote/deploy/releases');
        expect(shipit.releaseDirname).to.equal('20141704123136');
        expect(shipit.releasePath).to.equal('/remote/deploy/releases/20141704123136');
        done();
      });
    });
  });
});
