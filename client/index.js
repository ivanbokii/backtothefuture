var _ = require('lodash');
var program = require('commander');
var colors = require('colors/safe');
var client = require('./client');
var config = require('./config.json');
var common = require('./common');

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

var timerSend = function(getInterval) {
  setTimeout(function() {
    process.stdout.write('.');
    send(handleResponse);
    timerSend(getInterval);
  }, getInterval());
};

program
  .option('-r --repeat <interval in seconds>', 'repeatedly send random data, if interval is 0 - use random number of seconds between 1 and 10 mins', parseInt)
  .parse(process.argv);

if (_.isNumber(program.repeat)) {
  console.log(colors.green("REPEATING SEND"));

  var getInterval = _.constant(program.repeat * 1000);

  if (program.repeat === 0) {
    console.log("use random number of seconds between 1 and 10 mins");
    getInterval = function() { return common.getRandomInt(1, 600) * 1000; };
  }

  timerSend(getInterval);
} else {
  console.log(colors.green("SINGLE SEND"));
  send(handleResponse);
}

