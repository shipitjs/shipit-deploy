var sinon = require('sinon');
require('sinon-as-promised');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var publishFactory = require('../../../../tasks/deploy/publish');

describe('deploy:publish task', function () {
  var shipit;

  beforeEach(function () {
    shipit = new Shipit({
      environment: 'test',
      log: sinon.stub()
    });

    publishFactory(shipit);

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy'
      }
    });

    shipit.releasePath = '/remote/deploy/releases/20141704123138';
    shipit.releaseDirname = '20141704123138';

    sinon.stub(shipit, 'remote').resolves();
  });

  afterEach(function () {
    shipit.remote.restore();
  });

  it('should update the synonym link', function (done) {
    shipit.start('deploy:publish', function (err) {
      if (err) return done(err);
      expect(shipit.currentPath).to.equal('/remote/deploy/current');
      expect(shipit.remote).to.be.calledWith('cd /remote/deploy && ln -nfs releases/20141704123138 current');
      done();
    });
  });
});
