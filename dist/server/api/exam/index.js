'use strict';

var express = require('express');
var controller = require('./exam.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/:subject/:exam/:section', auth.isAuthenticated(), controller.getExam);
router.put('/:id/counters', controller.updateAnsweredCounters);
router.post('/wish-goodluck', auth.isAuthenticated(), controller.wishGoodluck);
router.get('/notifications/remove', auth.isAuthenticated(), controller.removeNotifications);
module.exports = router;
