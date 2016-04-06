'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server domain
  domain: process.env.DOMAIN,

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  //seedDB: false,
    seedDB: true,

  // Restrict Signup to approved e-mails only?
  isBeta: true,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.SESSION_SECRET || 'fsa-secret'
  },

  // List of possible subjects
  subjects: ['APCalcAB',
             'APCalcBC',
             'APCompSci',
             'APStats',
             'APPhysics1',
             'APPhysics2',
             'APEngLanguage',
             'APEngLiterature',
             'APEurHistory',
             'APUSHistory',
             'APWorldHistory',
             'APMicroecon',
             'APMacroecon',
             'APPsych',
             'APBio',
             'APChem',
             'APEnvSci',
             'APSpanLanguage',
             'APUSGovt',
             'APHumGeo'],

  // List of user roles
  userRoles: ['guest', 'user', 'customer', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  },

  edmodo: {
    clientID:     process.env.EDMODO_ID || 'id',
    clientSecret: process.env.EDMODO_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/edmodo/callback'
  },

  braintreeEnv:   process.env.BRAINTREE_ENV,
  braintree: {
    merchantId:   process.env.BRAINTREE_ID,
    publicKey:    process.env.BRAINTREE_PB_KEY,
    privateKey:   process.env.BRAINTREE_PV_KEY
  },

  mandrill: {
    username:     process.env.MANDRILL_USERNAME,
    apiKey:       process.env.MANDRILL_API_KEY
  },

  ac: {
    url:          process.env.AC_API_URL,
    apiKey:       process.env.AC_API_KEY
  },

  mongoCreds: {
    devIp:        process.env.MONGODEV_IP,
    devPort:      process.env.MONGODEV_PORT,
    proIp:        process.env.MONGOPRO_IP,
    proPort:      process.env.MONGOPRO_PORT,
    proUser:      process.env.MONGOPRO_USER,
    proPass:      process.env.MONGOPRO_PASS,
    env:          process.env.HOSTING_ENV,
    serverSize:   process.env.SERVER_SIZE
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
