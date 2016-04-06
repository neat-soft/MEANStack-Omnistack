'use strict';

var express = require('express');
var controller = require('./share.controller');

var router = express.Router();

router.post('/twitter', controller.tweet);

module.exports = router;