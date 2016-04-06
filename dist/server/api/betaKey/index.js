'use strict';

var express = require('express');
var controller = require('./betaKey.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/validate/:key', controller.validate);
router.get('/:id', controller.show);
router.post('/use/:id', controller.use);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/claimed', auth.hasRole('admin'), controller.destroyClaimed);
router.delete('/expired', auth.hasRole('admin'), controller.destroyExpired);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
module.exports = router;
