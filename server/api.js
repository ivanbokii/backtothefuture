var Datastore = require('nedb');
var moment = require('moment');
var _ = require('lodash');
var api = {};
var db = null;

api.initStorage = function() {
  db = new Datastore({filename: './db/backtothefuture.db', autoload: true});
  db.ensureIndex({fieldName: 'timestamp'});
};

api.saveLowBattery = function(lowBatteryData, done) {
  lowBatteryData.timestamp = lowBatteryData.timestamp.valueOf();
  return db.insert(lowBatteryData, done);
};

api.totalForDay = function(timestamp, done) {
  var startOfDay = moment.utc(timestamp).startOf('day');
  var endOfDay = moment(startOfDay).endOf('day');

  return db.count({timestamp: {$gte: startOfDay.valueOf(), $lt: endOfDay.valueOf()}}, done);
};

api.averageForDay = function(timestamp, done) {
  var startOfDay = moment.utc(timestamp).startOf('day');
  var endOfDay = moment(startOfDay).endOf('day');

  return db.find({timestamp: {$gte: startOfDay.valueOf(), $lt: endOfDay.valueOf()}}, {_id: 0}, function(err, docs) {
    if (err) {
      return done(err);
    }

    var total = docs.length;
    var levelSum = _.sumBy(docs, 'value');
    var result = total !== 0 ? levelSum / total : 0;

    return done(null, result);
  });
};

module.exports = api;
