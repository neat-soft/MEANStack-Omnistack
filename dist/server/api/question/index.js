'use strict';

var express = require('express');
var controller = require('./question.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/practice/:subject/:topic?', controller.findPractice);
router.get('/tags/:subject?', controller.showTags);
router.get('/', auth.hasRole('Admin'), controller.index);
router.get('/bySubject/:subject', controller.bySubject);
router.get('/:id', controller.show);
router.post('/comment/:id', controller.addComment);
router.put('/linkToEmail', controller.updateWithEmail);
router.post('/mine', auth.hasAdminOrTeacher(), controller.createTeacher);
router.post('/', controller.create);
router.put('/vote/:id', auth.isAuthenticated(), controller.vote);
router.put('/mine/:id', auth.hasAdminOrTeacher(), controller.updateMine);
router.put('/:id', auth.hasRole('Admin'), controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
