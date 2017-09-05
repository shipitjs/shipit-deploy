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

  it('should create workspace, create repo, checkout and call sync', function (done) {
    shipit.start('deploy:fetch', function (err) {
      if (err) return done(err);
      expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
      expect(shipit.local).to.be.calledWith('git init', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git remote', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith(
        'git remote add shipit git://website.com/user/repo',
        {cwd: '/tmp/workspace'}
      );
      expect(shipit.local).to.be.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git checkout master', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git branch --list master', {cwd: '/tmp/workspace'});
      done();
    });
  });

  it('should create workspace, create repo, checkout shallow and call sync', function (done) {
    shipit.config.shallowClone = true;

    shipit.start('deploy:fetch', function (err) {
      if (err) return done(err);
      expect(shipit.local).to.be.calledWith('rm -rf ..?* .[!.]* *', {cwd: '/tmp/workspace'});
      expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
      expect(shipit.local).to.be.calledWith('git init', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git remote', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith(
        'git remote add shipit git://website.com/user/repo',
        {cwd: '/tmp/workspace'}
      );
      expect(shipit.local).to.be.calledWith('git fetch shipit --prune --depth=1 && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git checkout master', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git branch --list master', {cwd: '/tmp/workspace'});
      done();
    });
  });

  it('should create workspace, create repo, checkout and call sync, update submodules', function (done) {
    shipit.config.updateSubmodules = true;

    shipit.start('deploy:fetch', function (err) {
      if (err) return done(err);
      expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
      expect(shipit.local).to.be.calledWith('git init', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git remote', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith(
          'git remote add shipit git://website.com/user/repo',
          {cwd: '/tmp/workspace'}
      );
      expect(shipit.local).to.be.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git checkout master', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git branch --list master', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git submodule update --init --recursive', {cwd: '/tmp/workspace'});
      done();
    });
  });

  it('should create workspace, create repo, set repo config, checkout and call sync', function (done) {
    shipit.config.gitConfig = {
      foo: 'bar',
      baz: 'quux',
    };

    shipit.start('deploy:fetch', function (err) {
      if (err) return done(err);
      expect(mkdirpMock).to.be.calledWith('/tmp/workspace');
      expect(shipit.local).to.be.calledWith('git init', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git config foo "bar"', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git config baz "quux"', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git remote', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith(
        'git remote add shipit git://website.com/user/repo',
        {cwd: '/tmp/workspace'}
      );
      expect(shipit.local).to.be.calledWith('git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git checkout master', {cwd: '/tmp/workspace'});
      expect(shipit.local).to.be.calledWith('git branch --list master', {cwd: '/tmp/workspace'});
      done();
    });
  });
});
