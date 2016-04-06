'use strict';

var _ = require('lodash');
var Settings = require('./settings.model');

// Get list of settingss
exports.index = function(req, res) {
  Settings.find(function (err, settingss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(settingss);
  });
};

// Get a single settings
exports.show = function(req, res) {
  Settings.findById(req.params.id, function (err, settings) {
    if(err) { return handleError(res, err); }
    if(!settings) { return res.send(404); }
    return res.json(settings);
  });
};

// Get a setting by name
exports.showName = function(req, res) {
  Settings.findOne({'name': req.params.name}, function(err, settings) {
    if (err) {
      return handleError(res, err);
    }
    if(!settings) { return res.send(404); }
    return res.json(settings);
  });
};

// Creates a new settings in the DB.
exports.create = function(req, res) {
  Settings.create(req.body, function(err, settings) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(settings);
  });
};

// Updates an existing settings in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Settings.findById(req.params.id, function (err, settings) {
    if (err) { return handleError(res, err); }
    if(!settings) { return res.send(404); }
    var updated = _.merge(settings, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(settings);
    });
  });
};

// Updates a setting by name
exports.updateName = function(req, res) {
  Settings.findOne({name: req.params.name}, function(err, settings) {
    if (err) { return handleError(res, err); }
    if (!settings) {
      var setting = {name: req.params.name};
      var newSettings = _.merge(setting, req.body);
      Settings.create(newSettings, function(err, settings) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(settings);
      });
    }
    else {
      var updated = _.merge(settings, req.body);
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(updated);
      });
    }
  });
};

// Deletes a settings from the DB.
exports.destroy = function(req, res) {
  Settings.findById(req.params.id, function (err, settings) {
    if(err) { return handleError(res, err); }
    if(!settings) { return res.send(404); }
    settings.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
