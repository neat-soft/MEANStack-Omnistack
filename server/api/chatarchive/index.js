'use strict';

var express = require('express');
var controller = require('./chatarchive.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/:room/:page/:limit', controller.index);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/export/chats', auth.hasRole('admin'), controller.exportToJSON);
router.get('/download/chats/file/:fileName', controller.downloadJSON);

module.exports = router;
