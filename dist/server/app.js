/**
 * Forever File - starts npmApp.js and handles errors
 */

'use strict';

var forever = require('forever-monitor');
var path = require('path');

var server = new (forever.Monitor)(path.join(__dirname, 'npmApp.js'));

server.on('exit', function() {
  console.log('npmApp.js has exited after ' + server.times + ' restarts.');
});

server.on('restart', function() {
  console.error('Forever restarting script for the ' + server.times + ' time');
});

server.start();
