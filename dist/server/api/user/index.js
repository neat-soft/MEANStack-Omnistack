'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/stats/accountsSince', controller.getAccountsSince);
router.get('/roles', auth.hasRole('admin'), controller.giveRoles);
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/role', controller.changeRole);
router.put('/:id/update', auth.isAuthenticated(), controller.updateUser);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/setAcademicRole', auth.isAuthenticated(), controller.giveUserAcademicRole);
router.post('/customer', auth.hasRole('admin'), controller.createPaidAccount);
router.post('/', controller.create);
router.put('/:id/subject', auth.isAuthenticated(), controller.addSubjects);
router.post('/exists', controller.exists);
router.put('/:id/omnipoints', controller.updateOmniPoints);
router.put('/omnipoints/email/:email', controller.updateOmniPointsByEmail);
router.post('/exams/stats', auth.isAuthenticated(), controller.updateExamStats);
router.get('/exams/list/:id', auth.isAuthenticated(), controller.getExamsList);
router.put('/:id/savesubjectstaught', controller.updateSubjectsTaught);
router.get('/students/list/:subject/:page/:limit/:name*?', auth.hasAdminOrTeacher(), controller.getStudents);
module.exports = router;
