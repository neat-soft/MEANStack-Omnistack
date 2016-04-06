'use strict';

var express = require('express');
var controller = require('./survey.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/forUser/:id', controller.userSurvey);
router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/enable/:id', auth.hasRole('admin'), controller.enable);
router.put('/disable/:id', auth.hasRole('admin'), controller.disable);
router.put('/:id', controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
