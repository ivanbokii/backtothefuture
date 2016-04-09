var request = require('request');
var common = require('./common');
var client = {};

client.LOW_BATTERY_THRESHOLD = 20;
client.MIN_SENDER_ID = 1;
client.MAX_SENDER_ID = 100;

client.generateLowBatteryData = function() {
  return {
    value: common.getRandomInt(0, client.LOW_BATTERY_THRESHOLD),
    timestamp: Date.now(),
    sender: common.getRandomInt(client.MIN_SENDER_ID, client.MAX_SENDER_ID)
  };
};

client.send = function(config, data, done) {
  var jsonData = JSON.stringify(data);
  request.post(`${config.serverUrl}${config.lowBatteryPath}`, {json: jsonData}, done);
};

module.exports = client;
