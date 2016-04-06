'use strict';

var express = require('express');
var controller = require('./classroom.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/byTeacher/tagAveragesForClass/:code', auth.hasAdminOrTeacher(), controller.showTeacherTagsByCode);
router.get('/byTeacher/byName/:name', auth.hasAdminOrTeacher(), controller.showTeacherByName);
router.get('/byTeacher/byCode/:code', auth.hasAdminOrTeacher(), controller.showTeacherByCode);
router.get('/byTeacher', auth.hasAdminOrTeacher(), controller.showTeacher);
router.put('/setUpdate/:classCode/:assignmentCode/:interval', controller.setUpdate);
router.put('/unsetUpdate/:classCode/:assignmentCode', controller.unsetUpdate);
router.post('/signUpByCode/:code', auth.isAuthenticated(), controller.signUpByCode);
router.get('/peer/:classCode/:assignmentCode', auth.isAuthenticated(), controller.getSubmissionForPeer);
router.post('/peer/:classCode/:assignmentCode', auth.isAuthenticated(), controller.postSubmissionForPeer);
router.get('/byStudent/byCode/:code', auth.isAuthenticated(), controller.showStudentByCode);
router.get('/byStudent', auth.isAuthenticated(), controller.showStudent);
//router.get('/:id', auth.hasAdminOrTeacher(), controller.show);
router.get('/:id', controller.show);
router.put('/addEmailByCode/:code', controller.addEmailByCode);
router.put('/addTeacherByCode/:code', auth.isAuthenticated(), controller.addTeacherByCode);
router.post('/assign', auth.hasRole('teacher'), controller.assign);
router.post('/student/:classCode/:assignmentCode', auth.isAuthenticated(), controller.studentAssignment);
router.post('/announcement', auth.hasRole('teacher'), controller.announce);
router.post('/message/:classId', auth.isAuthenticated(), controller.message);
router.post('/', auth.hasAdminOrTeacher(), controller.create);
router.put('/:id', auth.hasAdminOrTeacher(), controller.update);
router.patch('/:id', auth.hasAdminOrTeacher(), controller.update);
router.delete('/:id', auth.hasAdminOrTeacher(), controller.destroy);

module.exports = router;
