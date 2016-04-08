var _ = require('lodash');
var expect = require('chai').expect;
var sinon = require('sinon');
var moment = require('moment');
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

  //due to stupid initialization of nedb, there is a dependency on running
  //this test first
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
      var date = new Date();
      var data = {hello: "world", timestamp: date};
      var expected = {hello: "world", timestamp: date.valueOf()};

      api.saveLowBattery(data, function() {
        expect(nedb.insert.args[0][0]).to.deep.equal(expected);
        return done();
      });
    });

    it('should error if insertion fails', function(done) {
      nedb.insert.yields('error');

      api.saveLowBattery({timestamp: new Date()}, function(err) {
        expect(err).to.deep.equal('error');
        return done();
      });
    });
  });

  describe('totalForDay', function() {
    beforeEach(function() {
      nedb.count = sinon.stub().yields();
    });

    it('should return number of events for a specific day', function(done) {
      var timestamp = Date.now();
      var startOfDay = moment.utc(timestamp).startOf('day');
      var endOfDay = moment.utc(timestamp).endOf('day');

      nedb.count.withArgs({timestamp: {$gte: startOfDay.valueOf(), $lt: endOfDay.valueOf()}}).yields(null, 100);

      api.totalForDay(timestamp, function(err, total) {
        expect(total).to.equal(100);
        return done();
      });
    });

    it('should fail if counting records fails', function(done) {
      nedb.count.yields('error');

      api.totalForDay(100, function(err) {
        expect(err).to.equal('error');
        return done();
      });
    });
  });

  describe('averageForDay', function() {
    beforeEach(function() {
      nedb.find = sinon.stub().yields();
    });

    it('should return average battery level for a specific day', function(done) {
      var timestamp = Date.now();
      var startOfDay = moment.utc(timestamp).startOf('day');
      var endOfDay = moment.utc(timestamp).endOf('day');
      var docs = [{value: 10}, {value: 12}];

      nedb
        .find
        .withArgs({timestamp:
                   {$gte: startOfDay.valueOf(),
                    $lt: endOfDay.valueOf()}})
        .yields(null, docs);

      api.averageForDay(timestamp, function(err, average) {
        expect(average).to.equal(11);
        return done();
      });
    });

    it('should return 0 if there were no records for a day', function(done) {
      var timestamp = Date.now();
      var startOfDay = moment.utc(timestamp).startOf('day');
      var endOfDay = moment.utc(timestamp).endOf('day');
      var docs = [];

      nedb
        .find
        .withArgs({timestamp:
                   {$gte: startOfDay.valueOf(),
                    $lt: endOfDay.valueOf()}})
        .yields(null, docs);

      api.averageForDay(timestamp, function(err, average) {
        expect(average).to.equal(0);
        return done();
      });
    });

    it('should fail if records from the storage fails', function(done) {
      nedb.find.yields('error');

      api.totalForDay(100, function(err) {
        expect(err).to.equal('error');
        return done();
      });
    });
  });
});
