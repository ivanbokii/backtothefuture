var Hapi = require('hapi');
var Joi = require('joi');
var inert = require('inert');
var server = new Hapi.Server();
var api = require('./api');

server.register(inert, function() {
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

  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      reply.file('./server/index.html');
    }
  });

  server.route({
    method: 'GET',
    path: '/api/day/{timestamp}/total',
    handler: function(request, reply) {
      api.totalForDay(request.params.timestamp, function(err, data) {
        if (err) {
          return reply(err).code(500);
        }

        return reply(data).code(200);
      });
    },
    config: {
      validate: {
        params: {
          timestamp: Joi.date().timestamp('javascript')
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/api/day/{timestamp}/average',
    handler: function(request, reply) {
      api.averageForDay(request.params.timestamp, function(err, data) {
        if (err) {
          return reply(err).code(500);
        }

        return reply(data).code(200);
      });
    },
    config: {
      validate: {
        params: {
          timestamp: Joi.date().timestamp('javascript')
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: './server/public'
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
});

