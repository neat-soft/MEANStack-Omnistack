'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'https://localhost:9000',
  SESSION_SECRET:   'fsa-secret',

  AC_API_URL:       'https://omninox.api-us1.com',
  AC_API_KEY:       'eab5bf86ac12deffe120d7048160f45512ce8fa819cc4c3c9330c556237234ec05b67f57',

  FACEBOOK_ID:      'app-id',
  FACEBOOK_SECRET:  'secret',

  GOOGLE_ID:        'app-id',
  GOOGLE_SECRET:    'secret',

  BRAINTREE_ID:     'xcypwswg2ydhy4s7',
  BRAINTREE_PB_KEY: 'znjb2cvrhg3cjtn9',
  BRAINTREE_PV_KEY: '92f3eb69b8a8dd1b9a71d40f0ba4ee54',

  MANDRILL_API_KEY: '9-dxcCmzxKy4DKypwZT5Cw',

  // Control debug level for modules using visionmedia/debug
  DEBUG: 'http*,socket.io:socket*',
  //MONGODB_URI: 'mongodb://128.227.123.79:56789/fsa'
  MONGODB_URI: 'mongodb://localhost/fsa-dev'
};