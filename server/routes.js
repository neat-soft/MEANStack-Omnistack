/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/assignments', require('./api/assignment'));
  app.use('/api/classrooms', require('./api/classroom'));
  app.use('/api/userAnalytics', require('./api/userAnalytic'));
  app.use('/api/questions', require('./api/question'));
  app.use('/api/surveyResponses', require('./api/surveyResponse'));
  app.use('/api/surveys', require('./api/survey'));
  app.use('/api/settings', require('./api/settings'));
  app.use('/api/shares', require('./api/share'));
  app.use('/api/coupons', require('./api/coupon'));
  app.use('/api/communityLeaders', require('./api/communityLeaders'));
  app.use('/api/exams', require('./api/exam'));
  app.use('/api/omnipoints', require('./api/omnipoint'));
  app.use('/api/blockusers', require('./api/blockuser'));
  app.use('/api/chatrooms', require('./api/chatrooms'));
  app.use('/api/chatarchives', require('./api/chatarchive'));
  app.use('/api/chatmessages', require('./api/chatmessage'));
  app.use('/api/forgot-password', require('./api/forgot-password'));
  app.use('/api/emails', require('./api/email'));
  app.use('/api/tokens', require('./api/token'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/betaKeys', require('./api/betaKey'));
  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes except /blog should redirect to the index.html
  app.route(/^((?!\/blog).)*$/)
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
