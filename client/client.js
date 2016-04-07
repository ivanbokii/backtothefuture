var request = require('request');
var client = {};

//Returns a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.LOW_BATTERY_THRESHOLD = 20;
client.MIN_SENDER_ID = 1;
client.MAX_SENDER_ID = 100;

client.generateLowBatteryData = function() {
  return {
    value: getRandomInt(0, client.LOW_BATTERY_THRESHOLD),
    timestamp: Date.now(),
    sender: getRandomInt(client.MIN_SENDER_ID, client.MAX_SENDER_ID)
  };
};

client.send = function(config, data, done) {
  var jsonData = JSON.stringify(data);
  request.post(config.serverUrl, {json: jsonData}, done);
};

module.exports = client;
