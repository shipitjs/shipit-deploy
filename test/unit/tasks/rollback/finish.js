var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var initFactory = require('../../../../tasks/rollback/finish');

describe('rollback:finish task', function () {
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
