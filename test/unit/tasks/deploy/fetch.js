var rewire = require('rewire');
var sinon = require('sinon');
require('sinon-as-promised');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var fetchFactory = rewire('../../../../tasks/deploy/fetch');
var mkdirpMock = require('../../../mocks/mkdirp');

describe('deploy:fetch task', function () {
  var shipit;

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });
    shipit.stage = 'test';
    fetchFactory(shipit);

    fetchFactory.__set__('mkdirp', mkdirpMock);

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        repositoryUrl: 'git://website.com/user/repo'
      }
    });

    sinon.stub(shipit, 'local').resolves({
      stdout: 'ok'
    });
  });

  afterEach(function () {
    mkdirpMock.reset();
    shipit.local.restore();
  });

  context('when a fetch is required', function () {
    it('should create workspace, create repo, checkout and call sync', function (done) {
      shipit.start('deploy:fetch', function (err) {
        if (err) return done(err);
        expect(mkdirpMock).to.have.been.calledWith('/tmp/workspace');
        expect(shipit.local).to.have.been.calledWith('git init', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith('git remote', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith(
           'git remote add shipit git://website.com/user/repo',
           {cwd: '/tmp/workspace'}
        );
        expect(shipit.local).to.have.been.calledWith('git fetch shipit -p --tags', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith('git checkout master', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith('git branch --list master', {cwd: '/tmp/workspace'});
        done();
      });
    });

    it('should create workspace, create repo, checkout shallow and call sync', function (done) {
      shipit.config.shallowClone = true;

      shipit.start('deploy:fetch', function (err) {
        if (err) return done(err);
        expect(shipit.local).to.have.been.calledWith('rm -rf /tmp/workspace');
        expect(mkdirpMock).to.have.been.calledWith('/tmp/workspace');
        expect(shipit.local).to.have.been.calledWith('git init', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith('git remote', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith(
           'git remote add shipit git://website.com/user/repo',
           {cwd: '/tmp/workspace'}
        );
        expect(shipit.local).to.have.been.calledWith('git fetch --depth=1 shipit -p --tags', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith('git checkout master', {cwd: '/tmp/workspace'});
        expect(shipit.local).to.have.been.calledWith('git branch --list master', {cwd: '/tmp/workspace'});
        done();
      });
    });
  });

  context('when the workspace is already fetched', function () {
    it('should do nothing', function (done) {
      shipit.config.preFetched = true; // overwrite
      shipit.start('deploy:fetch', function (err) {
        if (err) return done(err);
        expect(mkdirpMock).to.not.have.been.called;
        expect(shipit.local).to.not.have.been.called;
        done();
      });
    });
  });
});
