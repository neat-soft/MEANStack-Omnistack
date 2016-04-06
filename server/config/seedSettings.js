/*
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Setting = require('../api/settings/settings.model');

var toSeed = [
  {
    name: 'accountTrackerDate',
    info: {
      date: new Date(Date.now() - 1000*60*60*24*7)
    }
  },
  {
    name: 'adminChatNotification',
    info: {
      active: true
    }
  },
  {
    name: 'subjects',
    info: {
      subjects: [
        {
          dbName: 'APCalcAB',
          fullName:  'AP Calculus AB'
        },
         {
           dbName: 'APCalcBC',
           fullName:  'AP Calculus BC'
         },
         {
           dbName: 'APCompSci',
           fullName:  'AP Computer Science'
         },
         {
           dbName: 'APStats',
           fullName:  'AP Statistics'
         },
         {
           dbName: 'APPhysics1',
           fullName:  'AP Physics 1'
         },
         {
           dbName: 'APPhysics2',
           fullName:  'AP Physics 2'
         },
         {
           dbName: 'APEngLanguage',
           fullName:  'AP English Language'
         },
         {
           dbName: 'APEngLiterature',
           fullName:  'AP English Literature'
         },
         {
           dbName: 'APEurHistory',
           fullName:  'AP European History'
         },
         {
           dbName: 'APUSHistory',
           fullName:  'AP US History'
         },
         {
           dbName: 'APWorldHistory',
           fullName:  'AP World History'
         },
         {
           dbName: 'APMicroecon',
           fullName:  'AP Microeconomics'
         },
         {
           dbName: 'APMacroecon',
           fullName:  'AP Macroeconomics'
         },
         {
           dbName: 'APPsych',
           fullName:  'AP Psychology'
         },
         {
           dbName: 'APBio',
           fullName:  'AP Biology'
         },
         {
           dbName: 'APChem',
           fullName:  'AP Chemistry'
         },
         {
           dbName: 'APEnvSci',
           fullName:  'AP Environmental Science'
         },
         {
           dbName: 'APSpanLanguage',
           fullName:  'AP Spanish Language'
         },
         {
           dbName: 'APUSGovt',
           fullName:  'AP US Government'
         },
         {
           dbName: 'APHumGeo',
           fullName:  'AP Human Geography'
         }
      ]
    }
  }
];

var parseQuery = function(q, seed) {
  q.exec(function(err, setting) {
    if (err) {console.log("Error: " + err);}
    if (!setting) {
      console.log("Creating a new setting for " + seed.name);
      var newSetting = new Setting(seed);
      newSetting.save(function(err, setting) {
        if (err) { console.log(err); }
        if (setting) { console.log(setting); }
      })
    }
    if (setting) {console.log("There was a " + setting.name + " setting found!");}
  });
}

for(var i = 0; i < toSeed.length; i++) {
  parseQuery(Setting.findOne({name: toSeed[i].name}), toSeed[i]);
}
