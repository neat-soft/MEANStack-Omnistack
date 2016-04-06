'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);
var ActiveCampaign = require('activecampaign');
var ac = new ActiveCampaign(config.ac.url, config.ac.apiKey);

var message = {
    "from_email": "noreply@omninox.org",
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
// Creates a new email in the DB.
exports.test = function(req, res) {
  mandrill_client.users.info({}, function (result) {
    console.log(result);
    return res.status(201).json('ping successful');
  }, function (err) {
    console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
    if(err) { return handleError(res, err); }
  });
};

exports.addToActiveCampaign = function (userObject, cb) {
  var contactObject = {
    email: userObject.email,
    'p[69]': 69,
    'field[97, 0]': userObject.role
  };
  var userName;
  if (userObject.name) {
    userName = userObject.name.split(' ');
    contactObject.first_name = userName[0];
    contactObject.last_name = userName[1];
  }
  ac.api('contact/add', contactObject, function (response) {
    if (response.result_message !== 'Contact added') {
      return cb('Contact could not be added', response);
      console.log(userObject);
      console.log('Failed to be added to ActiveCampaign');
    }
    return cb(false, response);
  });
};

exports.addAccessRequest = function (req, res) {
  ac.api('contact/add', {
    email: req.body.email,
    'p[72]': 72,
    'field[99, 0]': req.body.role
  }, function (response) {
    if (response.result_code === 1) {
      return res.status(200).json('success');
    } else {
      return handleError(res, response.result_message);
    }
  });
}

exports.findAndUpdate = function (oldEmail, newInfo, cb) {
  ac.api('contact/view?email='+oldEmail, {}, function (response) {
    // response contains existing user from oldEmail
    var apiObject = {
      email: newInfo.email,
      'p[69]': 69,
      'field[97, 0]': newInfo.academicRole
    };
    var userName = newInfo.name.split(' ');
    apiObject.first_name = userName[0];
    apiObject.last_name = userName[1];
    if(response.success == 1) {
      // Edit AC user
      apiObject.id = response.id;
      ac.api('contact/edit', apiObject, function (editResponse) {
        if (editResponse.success == 1) {
          return cb(false, editResponse);
        } else {
          return cb('unable to edit contact', apiObject);
        }
      });
    } else {
      ac.api('contact/add', apiObject, function (addResponse) {
        if (addResponse.success == 1) {
          return cb(false, addResponse);
        } else {
          return cb('contact not found and could not be added', apiObject);
        }
      });
    }

  });
};

exports.sendReceipt = function (transactionInfo, cb) {
  if (transactionInfo.toEmail && transactionInfo.transactionId && transactionInfo.subjects && transactionInfo.total) {
    var name = transactionInfo.name;
    var email = transactionInfo.toEmail;
    var transactionId = transactionInfo.transactionId;
    var total = transactionInfo.total;

    var subjects = '';
    // convert subjects into HTML-friendly string
    for (var subjectIndex = 0; subjectIndex < transactionInfo.subjects.length; subjectIndex++) {
      subjects += '<p>' + transactionInfo.subjects[subjectIndex] + '</p>';
    }

    var template_name = "receipt";
    var template_content = [{
      "name": "firstName",
      "content": name
    }, {
      "name": "subjects",
      "content": subjects
    }, {
      "name": "transactionId",
      "content": transactionId
    }, {
      "name": "total",
      "content": total
    }];

    message.to = [{
      "email": email,
      "name": name,
      "type": "to"
    }];
    mandrill_client.messages.sendTemplate({
      "template_name": template_name,
      "template_content": template_content,
      "message": message},
      function(result) {
        console.log(result);
        return cb(false, result);
    }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      return cb(e, transactionInfo)
    });
  } else {
    return handleError(res, 'Request body is missing required parameters. Either subjects, name, email, or transaction ID.');
  }
};

//Chat notification to Admin
exports.sendChatNotification = function (userObject, cb) {
  // Set variables required for sending email
  if (userObject.firstName && userObject.message && userObject.userEmail) {
    var toName = "Admin";
    var name = userObject.firstName;
    var email = "support@omninox.org";
    var msg = userObject.message;
    var userEmail = userObject.userEmail;
    var template_name = "chat-notification";
    var template_content = [
      {
        "name": "firstName",
        "content": name
      },
      {
        "name": "message",
        "content": msg
      },
      {
        "name": "userEmail",
        "content": userEmail
      }
    ];
    message.to = [{
      "email": email,
      "name": toName,
      "type": "to"
    }];
    mandrill_client.messages.sendTemplate({
        "template_name": template_name,
        "template_content": template_content,
        "message": message},
      function(result) {
        return cb(false, result);
      }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        return cb(e, userObject)
      });
  } else {
    return handleError(cb, 'Request body is missing required parameters name and email.');
  }
};

function handleError(res, err) {
  return res.send(500, err);
}
