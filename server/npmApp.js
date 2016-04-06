/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var fs = require('fs');

// Connect to database
if (config.env === 'production') {
  console.log('connecting to database in production');
  config.mongo.setUri(function() {
    console.log('setting the Uri successful. The uri is ' + config.mongo.uri);
    mongoose.connect(config.mongo.uri, config.mongo.options);
    return;
  })
} else {
  mongoose.connect(config.mongo.uri, config.mongo.options);
}

// Populate DB with sample data

if(config.seedDB) { require('./config/seed'); }
require('./config/seedSettings')

// Setup server
var app = express();
// serve http or https
var server;
if(config.env==='production' || config.env==='staging'){
  server = require('http').createServer(app);
} else {
  var options = {
    key: fs.readFileSync(__dirname + '/components/certificates/server.key'),
    cert: fs.readFileSync(__dirname + '/components/certificates/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
  };
  server = require('https').createServer(options, app);
}
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client',
  secure: true
});

require('./config/seedSettings');
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start scheduled jobs
require('./components/schedule/schedule');

// Start server
var ghost = require('ghost');
var path = require('path');

ghost({
  config: path.join(__dirname, 'ghost.conf.js')
}).then(function (ghostServer) {
  app.use('/blog', ghostServer.rootApp);
  ghostServer.start(server);
});

// Expose app
exports = module.exports = app;
