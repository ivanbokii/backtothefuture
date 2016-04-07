var Datastore = require('nedb');
var api = {};
var db = null;

api.initStorage = function() {
  db = new Datastore({filename: './db/backtothefuture.db', autoload: true});
  db.ensureIndex({fieldName: 'timestamp'});
};

api.saveLowBattery = function(lowBatteryData, done) {
  return db.insert(lowBatteryData, done);
};

module.exports = api;
