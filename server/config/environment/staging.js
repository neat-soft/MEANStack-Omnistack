'use strict';

var credentials = require('./credentials');
var databaseUser = credentials.username;
var databasePassword = credentials.password;
var production = databaseUser + ':' + databasePassword + '@' + process.env.MONGOPRO_PORT_27017_TCP_ADDR + ':' + process.env.MONGOPRO_PORT_27017_TCP_PORT + '/fsa';
var development = databaseUser + ':' + databasePassword + '@' + process.env.MONGOTEST_PORT_27017_TCP_ADDR + ':' + process.env.MONGOTEST_PORT_27017_TCP_PORT + '/fsa';

// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
    undefined,

    // Server port
    port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
    8080,

    // MongoDB connection options
    mongo: {
	uri:    'mongodb://localhost/fsa' + ',' + development + ',' + production
    },

    // Credit Card Processing Credentials w/ Braintree
    BraintreeCredentials: credentials.braintree
};