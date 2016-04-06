Omnistack
=========

Omninox website built using generator-angular-fullstack

# Getting started

## Requirements
- Node ([Install via PPA](https://rtcamp.com/tutorials/nodejs/node-js-npm-install-ubuntu/) or [Install from Node.js website](http://nodejs.org))
- npm (comes with node)
- Grunt (`[sudo] npm install -g grunt-cli`)
- MongoDB ([Installation Docs](http://docs.mongodb.org/manual/installation/))
- Yeoman (`[sudo] npm install -g yo`)

## Setup Commands
Setup is simple. First make sure MongoDB is running locally. Then simply type these commands into your working directory and watch the magic happen:
- `npm install`
- `bower install` (Use Angular 3.2.X)
- `grunt serve`

## Setup Local Environment

[Video of example local.env.js file](https://youtu.be/0Bp_dN9ShI8)

Under /server/config/ create a file called local.env.js. It should look like this:

```
'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'https://localhost:9000',
  SESSION_SECRET:   'fsa-secret',

  FACEBOOK_ID:      'app-id',
  FACEBOOK_SECRET:  'secret',

  GOOGLE_ID:        'app-id',
  GOOGLE_SECRET:    'secret',

  BRAINTREE_ID:     'xcypwswg2ydhy4s7',
  BRAINTREE_PB_KEY: 'znjb2cvrhg3cjtn9',
  BRAINTREE_PV_KEY: '92f3eb69b8a8dd1b9a71d40f0ba4ee54',

  MANDRILL_API_KEY: '9-dxcCmzxKy4DKypwZT5Cw',

  AC_API_URL:       'https://omninox.api-us1.com',
  AC_API_KEY:       'eab5bf86ac12deffe120d7048160f45512ce8fa819cc4c3c9330c556237234ec05b67f57',

  // Control debug level for modules using visionmedia/debug
  DEBUG: 'http*,socket.io:socket*',
<<<<<<< HEAD
  MONGODB_URI: 'mongodb://128.227.123.79:56789/fsa' 
  // use the below line for locally hosted MongoDB
=======
  MONGODB_URI: 'mongodb://128.227.123.79:56789/fsa'
  <!-- uncomment the following line for locally hosted MongoDB and comment the above line instead -->
>>>>>>> development
  // MONGODB_URI: 'mongodb://localhost/fsa'
};

```

The above API keys and credentials are all for testing, so you can play around with credit card processing (Braintree) and email notifications (Mandrill) without worrying about breaking anything. Note that the test API key for Mandrill does not actually send an email, but test emails are visible on the dashboard. It still provides valid response codes (200 means the email sent, anything else means it didn't).

## Contributing
- Create a branch on your local machine or through the Github repo.
- Commit to the branch. Make sure each commit is stable.
- Submit a merge/pull request once finished to the development branch.
- Note: Do not create a pull request to master and do not commit/sync to any other repo except for your branch. All changes to the development branch should be submitted via a pull request.

## Relevant Documentation
- Refer to the [Angular Fullstack Generator](https://github.com/DaftMonk/generator-angular-fullstack#controller) for details on how to add directives, controllers, API endpoints, etc.
- Documentation reference for the [Mandrill API](https://mandrillapp.com/api/docs/) and the [Node.js](https://mandrillapp.com/api/docs/index.nodejs.html) docs
- Documentation reference for [Node.js Braintree Integration](https://developers.braintreepayments.com/javascript+node)

## Project conventions
- Use descriptive names
- Instead of `ng-click` use `omni-tap` for events that occur on click for faster response on mobile devices (see pricing page for example)

## License
Copyright © 2014 Omninox Corp. All rights reserved. By accessing this repository, you agree that:
- The copyrights of all source code developed and commited to this repository are assigned to Omninox Corp.
- All source code contributed is either originally created by you or is part of the public domain.
- You will keep all sensitive information private, including but not limited to, API keys, code structure and control flow, key pieces of functionality, projects integrated into this repository, and any other information regarding this project that may be considered a trade secret. Disclosure of such information is subject to receiving permission from the repository owner.
- You may publicly post specific lines of code only for the express purpose of asking for help on websites such as Stack Overflow, excluding the sensitive information described above.

If you do not agree to the terms outlined above, please remove yourself from the repository and delete all copies of locally stored content on your computer related to this project.
