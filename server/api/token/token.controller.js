'use strict';

var _ = require('lodash');
var Token = require('./token.model');
var config = require('../../config/environment')
var braintree = require('braintree');
var emailService = require('../email/email.controller');
var gateway;
if (config.braintreeEnv === 'sandbox') {
  config.braintree.environment = braintree.Environment.Sandbox;
  gateway = braintree.connect(config.braintree);
} else {
  config.braintree.environment = braintree.Environment.Production;
  gateway = braintree.connect(config.braintree);
}
// Get a client side token from the server
exports.generateToken = function(req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(response.clientToken);
  });
};

// Creates a new request for sale with PayPal
exports.createTransaction = function(req, res) {
  var saleRequest = {
    amount: req.param('amount'),
    paymentMethodNonce: req.param('nonce'),
    options: {
      submitForSettlement: true
    }
  };
  gateway.transaction.sale(saleRequest, function (err, result) {
    if (err) {
      res.status(400).json(err);
    } else if (result.success) {
      res.json(200);
      // do not send receipt with Paypal
    } else {
      res.status(400).json(result.message);
    }
  });
};

// Function triggers when credit card transaction submitted
exports.createCardTransaction = function (req, res) {
  // Create transaction and submit for settlement using format below
  var transaction = {
    toEmail: req.body.email,
    subjects: req.body.subjects,
    name: req.body.name,
    total: req.body.saleAmount
  };
  if (req.body.nonceForServer && req.body.email && req.body.subjects && req.body.name && req.body.saleAmount) {
    gateway.transaction.sale({
      amount: req.body.saleAmount,
      paymentMethodNonce: req.body.nonceForServer,
      customer: {
        email: req.body.email
      },
      options: {
        submitForSettlement: true
      }
    }, function (err, result) {
      if (err) {
        // console.log(err);
        res.json(err);
      } else if (result.success) {
        transaction.transactionId = result.transaction.id;
        res.json(200);
        // send receipt
        console.log(transaction);
        emailService.sendReceipt(transaction, function (error, response) {
          if (error) {
            console.log ('Receipt could not be sent for ');
            console.log (response);
            handleError(response, error);
          }
        });
      } else {
        res.json(result.message);
      }
    });
  } else {
    res.json('Please fill out all of the fields');
  }
}

function handleError(res, err) {
  return res.send(500, err);
}