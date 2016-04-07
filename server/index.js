var Hapi = require('hapi');
var Joi = require('joi');
var server = new Hapi.Server();
var api = require('./api');

server.connection({
  host: 'localhost',
  port: 8080
});

server.route({
  method: 'POST',
  path: '/low-battery',
  handler: function(request, reply) {
    api.saveLowBattery(request.payload, function(err) {
      if (err) {
        return reply(err).code(500);
      }

      return reply('success').code(200);
    });
  },
  config: {
    validate: {
      payload: {
        value: Joi.number().min(0),
        timestamp: Joi.date().timestamp('javascript'),
        sender: Joi.number()
      }
    }
  }
});

server.start(function(err) {
  if (err) {
    throw err;
  }

  api.initStorage();
  console.log('Server running at: ', server.info.uri);
});
