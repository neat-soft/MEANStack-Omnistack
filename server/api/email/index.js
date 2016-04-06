'use strict';

var express = require('express');
var controller = require('./email.controller');

var router = express.Router();

router.post('/test', controller.test);
router.post('/request', controller.addAccessRequest);

module.exports = router;
