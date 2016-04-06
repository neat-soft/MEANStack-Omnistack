/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var UserCtrl = require('../api/user/user.controller');
var BetaKey = require('../api/betaKey/betaKey.model');
var seedUsers = [
  {
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    omnipoints:0,
    referral: {
      connectionLevel: 3
    }
  },
  {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin',
    omnipoints:0,
    referral: {
      connectionLevel: 0
    }
  },
  {
    provider: 'local',
    role: 'customer',
    name: 'Customer',
    email: 'customer@customer.com',
    password: 'customer', 
    academicRole: 'student',
    omnipoints:0,
    referral: {
      connectionLevel: 1
    },
    subjects: [{
      subjectName: 'APChem'
    }, {
      subjectName: 'APUSHistory'
    }]
  },
  {
    provider: 'local',
    role: 'customer',
    name: 'Teacher',
    email: 'teacher@teacher.com',
    password: 'teacher',
    academicRole: 'Teacher',
    omnipoints:0,
    referral: {
      connectionLevel: 1
    },
    subjects: [{
      subjectName: 'APChem'
    }, {
      subjectName: 'APUSHistory'
    }]
  },
  {
    provider: 'local',
    role: 'admin',
    name: 'Omninox Support',
    email: 'noreply@omninox.org',
    password: 'noreply',
    omnipoints:0,
    referral: {
      connectionLevel: 3
    }
  }
];

BetaKey.find({}).remove(function(err) {
  if (err) {
    console.log("Error removing old betaKey");
  }
});

var createTheUser = function(userData){
  UserCtrl.createUser(userData, function(err, user){
    if (err) {
      console.log("Error seeding user: " + err);
    }
  });
}
User.find({}).remove(function() {
  for (var i = 0; i < seedUsers.length; i++) {
    createTheUser(seedUsers[i]);
  }
});
