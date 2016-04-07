var _ = require('lodash');
var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var api;

describe('api', function() {
  var datastore;
  var datastoreParams;
  var nedb;

  before(function() {
    nedb = {
      ensureIndex: sinon.stub()
    };

    datastore = function(params) {
      datastoreParams = params;
      return nedb;
    };

    api = proxyquire('../api', {'nedb': datastore});
  });

  it('should init storage', function() {
    api.initStorage();

    expect(datastoreParams).to.deep.equal({filename: './db/backtothefuture.db', autoload: true});
    expect(nedb.ensureIndex.args[0][0]).to.deep.equal({fieldName: 'timestamp'});
  });

  describe('saveLowBattery', function() {
    beforeEach(function() {
      nedb.insert = sinon.stub().yields();
    });

    it('should insert data into the storage', function(done) {
      var data = {hello: "world"};
      api.saveLowBattery(data, function() {
        expect(nedb.insert.args[0][0]).to.deep.equal(data);
        return done();
      });
    });

    it('should error if insertion fails', function(done) {
      nedb.insert.yields('error');

      api.saveLowBattery({}, function(err) {
        expect(err).to.deep.equal('error');
        return done();
      });
    });
  });
});
