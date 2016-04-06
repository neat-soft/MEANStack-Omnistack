'use strict';

var express = require('express');
var controller = require('./communityLeaders.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/myrank', auth.isAuthenticated(), controller.myrank);


module.exports = router;
