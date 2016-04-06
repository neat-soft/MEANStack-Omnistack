'use strict';

var _ = require('lodash');
var Question = require('./question.model');

// Get list of questions
exports.index = function(req, res) {
  Question.find(function (err, questions) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(questions);
  });
};

// Look up practice questions for user
exports.findPractice = function(req, res) {
  var query = {
    subject: req.params.subject,
    type: 'mult'
  }
  if (req.params.topic) {
    query.tags = req.params.topic
  }
  Question.find(query).limit(5).exec(function(err, questions) {
    if (err) { return handleError(res, err); }
    if (!questions || questions.length === 0) { return res.status(404).send('Sorry, no questions found.'); }
    return res.send(questions);
  });
}

exports.showTags = function(req, res) {
  if (req.params.subject) {
    Question.find({subject: req.params.subject}).distinct('tags', function(err, tags) {
      if (err) { return handleError(res, err); }
      return res.json(tags);
    });
  } else {
    Question.find().distinct('tags', function(err, tags) {
      if (err) { return handleError(res, err); }
      return res.json(tags);
    });
  }
};

// Apply a vote to a question
exports.vote = function(req, res) {
  Question.findById(req.params.id, function(err, question) {
    if(err) { return handleError(res, err); }
    if (!question) { return res.send(404); }
    if (!req.body.type) { return handleError(res, 'No vote type added.'); }
    if (['plus','minus'].indexOf(req.body.type) < 0) { return handleError(res, 'Invalid Vote type.'); }
    if (!question.votes) {
      question.votes = {};
    }
    if (!question.score) {
      question.score = 0;
    }
    var update = {
      votes: {},
      score: question.score
    };
    if (req.body.type === 'plus') {
      if (question.votes[req.user._id]) {
        if (question.votes[req.user._id] === 'plus') {
          // remove a plus vote

          update.votes[req.user._id] = undefined;
          update.score = question.score - 1;
        }
        else {
          // change a minus to a plus
          update.votes[req.user._id] = 'plus';
          update.score = question.score + 2;
        }
      } else {
        // no prior vote
        update.votes[req.user._id] = 'plus';
        update.score = question.score + 1;
      }
    } else if (req.body.type === 'minus') {
      if (question.votes[req.user._id]) {
        if (question.votes[req.user._id] === 'minus') {
          // remove a minus vote
          update.votes[req.user._id] = undefined;
          update.score = question.score + 1;
        }
        else {
          // change a plus to a minus
          update.votes[req.user._id] = 'minus';
          update.score = question.score - 2;
        }
      } else {
        // no prior vote
        update.votes[req.user._id] = 'minus';
        update.score = question.score - 1;
      }
    } else {
      return handleError(res, 'Weird unknown vote error.');
    }
    Question.findByIdAndUpdate(question._id, {$set: update}, function(e, q) {
      if (e) { return handleError(res, e) }
      return res.json(q);
    });
  });
}

// Get a single question
exports.show = function(req, res) {
  Question.findById(req.params.id, function (err, question) {
    if(err) { return handleError(res, err); }
    if(!question) { return res.send(404); }
    return res.json(question);
  });
};

// Gets all questions of a single subject
exports.bySubject = function(req, res) {
  Question.find({subject: req.params.subject}, function(err, questions) {
    if (err) { return handleError(res, err); }
    if (!questions) { return res.send(404); }
    return res.json(questions);
  });
};

// Adds a comment to a question
exports.addComment = function(req, res) {
  Question.findById(req.params.id, function(err, question) {
    if(err) { return handleError(res, err); }
    if(!question) { return res.send(404); }
    if (!question.comments) {
      question.comments = [];
    }
    question.comments.push(req.body.comment);
    question.save(function(err, newQuestion) {
      if (err) { return handleError(res, err); }
      return res.json(newQuestion.comments[newQuestion.comments.length-1]);
    });
  });
}

// Creates a new question in the DB.
exports.create = function(req, res) {
  Question.create(req.body, function(err, question) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(question);
  });
};

// Creates a new question in the DB for a teacher.
exports.createTeacher = function(req, res) {
  var newQuestion = req.body;
  newQuestion.author = req.user._id;
  Question.create(req.body, function(err, question) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(question);
  });
};

exports.updateWithEmail = function(req, res) {
  Question.find({_id: {$in: req.body.questionIds}}).update({$set: {authorEmail: req.body.email}}).exec(function(err, questions) {
    if (err) { return handleError(res, err); }
    return res.send(questions);
  });
};

// Updates an existing question in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Question.findById(req.params.id, function (err, question) {
    if (err) { return handleError(res, err); }
    if(!question) { return res.send(404); }
    var updated = _.merge(question, req.body, function(a,b) {
      if (_.isArray(a)) {
        return b;
      }
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(question);
    });
  });
};

// Updates an existing question in the DB owned by requester.
exports.updateMine = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Question.findById(req.params.id, function (err, question) {
    if (err) { return handleError(res, err); }
    if(!question) { return res.send(404); }
    if (JSON.stringify(question.author) !== JSON.stringify(req.user._id)) { return res.status(403).send('You are not the author of that question.'); }
    var update = question = _.merge(question, req.body, function(a,b) {
      if (_.isArray(a)) {
        return b;
      }
    });
    update.save(function (err) {
      if (err) { return handleError(res, err);}
      return res.status(200).json(question);
    });
  });
};

// Deletes a question from the DB.
exports.destroy = function(req, res) {
  Question.findById(req.params.id, function (err, question) {
    if(err) { return handleError(res, err); }
    if(!question) { return res.send(404); }
    question.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
