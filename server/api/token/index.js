'use strict';

var express = require('express');
var controller = require('./token.controller');

var router = express.Router();

router.get('/', controller.generateToken);
router.post('/', controller.createTransaction);
router.post('/card', controller.createCardTransaction);

module.exports = router;