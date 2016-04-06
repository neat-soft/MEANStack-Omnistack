'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');
var auth = require('./auth.service');

// Passport Configuration
require('./local/passport').setup(User, config);
require('./facebook/passport').setup(User, config);
require('./google/passport').setup(User, config);
require('./edmodo/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/google', require('./google'));
router.use('/edmodo', require('./edmodo'));

//Other auth services
router.post('/resetStatDate', auth.hasRole('admin'), auth.resetStatCounter);
router.get('/resetStatDate', auth.hasRole('admin'), auth.giveStatCounter);
router.get('/isBeta', auth.isBeta)
module.exports = router;
