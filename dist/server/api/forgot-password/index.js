'use strict';

var express = require('express');
var controller = require('./forgot.controller.s');

var router = express.Router();

router.post('/generateToken', controller.generateToken);
router.post('/resetPassword', controller.resetPassword);

module.exports = router;
