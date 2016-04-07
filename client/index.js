var _ = require('lodash');
var program = require('commander');
var colors = require('colors/safe');
var client = require('./client');
var config = require('./config.json');

var send = function(done) {
  var data = client.generateLowBatteryData();
  client.send(config, data, done);
};

var handleResponse = function(err, response) {
  if (err) {
    console.log(colors.red(err));
    console.log(colors.red("Sorry, there was some error while sending the data. Terminating."));
    process.exit(1);
  }
};

program
  .option('-r --repeat <interval in seconds>', 'repeatedly send random data', parseInt)
  .parse(process.argv);

if (program.repeat) {
  console.log(colors.green("REPEATING SEND"));

  setInterval(function() {
    send(handleResponse);
  }, program.repeat * 1000);
} else {
  console.log(colors.green("SINGLE SEND"));
  send(handleResponse);
}

