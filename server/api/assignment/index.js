'use strict';

var express = require('express');
var controller = require('./assignment.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.hasAdminOrTeacher(), controller.index);
router.get('/:assignmentId/withQuestions', auth.hasAdminOrTeacher(), controller.showWithQuestions);
router.get('/byClassAndCode/:classCode/:assignmentCode', auth.isOptionallyAuthenticated(), controller.showByClassAndCode);
router.get('/byAuthor/:id?', auth.hasAdminOrTeacher(), controller.byAuthor);
router.get('/:id', auth.hasAdminOrTeacher(), controller.show);
router.post('/fromTeacher', auth.hasAdminOrTeacher(), controller.createForTeacher);
router.post('/nonUser', controller.createForNonUser);
router.post('/', auth.hasAdminOrTeacher(), controller.create);
router.put('/:assignmentCode', auth.hasAdminOrTeacher(), controller.update);
router.patch('/:id', auth.hasAdminOrTeacher(), controller.update);
router.delete('/:id', auth.hasAdminOrTeacher(), controller.destroy);

module.exports = router;
