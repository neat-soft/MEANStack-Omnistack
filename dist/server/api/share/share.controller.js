'use strict';

var Share = require('./share.model');
var https = require('https');
var fs = require('fs');

// Get list of shares
exports.tweet = function(req, res) {
  console.log(encodeURIComponent(req.body.url))
  https.get('https://api-ssl.bitly.com/v3/shorten?access_token=690a7ab7d89ed8857b9ad826705a3cc2b65aaed3&longUrl=' + encodeURIComponent(req.body.url) + '%2F', function (response) {
    console.log("response received");
    response.on('data', function (chunk) {
      var shortUrl = chunk.toString('utf8');
      res.json(JSON.parse(shortUrl));
      // process.stdout.write(shortUrl);
    });
    response.on('error', function (error) {
      res.json(0);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}