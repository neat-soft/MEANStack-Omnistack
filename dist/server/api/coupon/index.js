'use strict';

var express = require('express');
var controller = require('./coupon.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/use/:code', controller.use);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/limitReached', auth.hasRole('admin'), controller.destroyLimitReached);
router.delete('/expired', auth.hasRole('admin'), controller.destroyExpired);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/getByCode/:code', controller.getByCode);

module.exports = router;
