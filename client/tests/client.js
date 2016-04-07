var _ = require('lodash');
var expect = require('chai').expect;
var client = require('../client');
var clientConfig = require('../config.json');
var request = require('request');
var sinon = require('sinon');

describe('client', function() {
  beforeEach(function() {
    sinon.stub(request, 'post').yields();
  });

  afterEach(function() {
    request.post.restore();
  });

  it('should generate low battery data', function() {
    var lowBattery = client.generateLowBatteryData();

    expect(_.isNumber(lowBattery.value)).to.be.true;
    expect(lowBattery.value).to.be.least(0);
    expect(lowBattery.value).to.be.most(client.LOW_BATTERY_THRESHOLD);
    expect(_.isNumber(lowBattery.timestamp)).to.be.true;
    expect(_.isNumber(lowBattery.sender)).to.be.true;
  });

  it('should send data to server url', function(done) {
    var dataToSend = {hello: 'world'};

    client.send(clientConfig, dataToSend, function() {
      expect(request.post.args[0][0]).to.equal(clientConfig.serverUrl);
      expect(request.post.args[0][1]).to.deep.equal({json: JSON.stringify(dataToSend)});
      return done();
    });
  });

  it('should error if sending fails', function(done) {
    request.post.yields('error');

    client.send(clientConfig, {}, function(err) {
      expect(err).to.exist;
      return done();
    });
  });
});
