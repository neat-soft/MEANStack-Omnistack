'use strict';

var _ = require('lodash');
var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var crypto = require('crypto');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);
var emailService = require('../email/email.controller');

var message = {
  "from_email": "support@omninox.org",
  "from_name": "Jake from Omninox",
  "headers": {
    "Reply-To": "support@omninox.org"
  },
  "important": false,
  "track_opens": true,
  "track_clicks": true,
  "auto_text": null,
  "auto_html": null,
  "inline_css": null,
  "url_strip_qs": null,
  "preserve_recipients": null,
  "view_content_link": null,
  "bcc_address": "noreply@omninox.org",
  "tracking_domain": null,
  "signing_domain": null,
  "return_path_domain": null,
  "merge": false,
  "merge_language": "mailchimp",
  "google_analytics_domains": [
    "omninox.org"
  ],
  "metadata": {
    "website": "www.omninox.org"
  }
};

// Creates a new forgot-password
exports.generateToken = function(req, res) {
  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');

    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        return res.status(404).json({message: 'No account with that email address exists.'});
      }

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + (3600000 * 24); // 24 hours

      user.save(function(err) {
        var resetUrl = config.domain + '/reset/token/' + token;
        sendPasswordResetEmail(user.name, user.email, resetUrl, function(err, result){
          if(!err) {
            res.json({success: 'true'});
          }
          else {
            res.status(404).json({message: 'An error has occurred.'});
          }
        });
      });
    });
  });
};

exports.resetPassword = function(req, res) {
  User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.status(404).json({message: 'Password reset token is invalid or has expired.'});
    }

    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save(function(err, savedUser) {
      if (err) {
        return handleError(res, err);
      }

      // remove the following lines after migrated users have signed up
      var userObject = {
        email: savedUser.email,
        role: savedUser.academicRole
      };
      emailService.addToActiveCampaign(userObject, function (error, res) {
        return;
      });
      // end lines to be removed

      res.json({success: 'true'});
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

function sendPasswordResetEmail(name, email, resetUrl, callback){
  if (name && email && resetUrl) {
    var name = name;
    var email = email;
    var resetUrl = resetUrl;
    var template_name = "forgot-password";
    var template_content = [{
      "name": "firstName",
      "content": name
    }, {
      "name": "resetLink",
      "content": resetUrl
    }];
    message.to = [{
      "email": email,
      "name": name,
      "type": "to"
    }];
    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message}, function(result) {
      console.log(result);
      if(result[0].status === 'sent') {
        callback(null, result)
      } else {
        callback(result, null);
      }
    }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      callback(e, null);
    });
  } else {
    return handleError(res, 'Request body is missing required parameters');
  }
}
