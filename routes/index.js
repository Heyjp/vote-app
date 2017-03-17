var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

var Polls = require('../config/polls')

router.get('/favicon.ico', function(req, res) {
  console.log("favicon requested");
  res.writeHead(200, {'Content-Type': 'image/x-icon'} );
  res.end();
  console.log('favicon requested');
  return;
});

router.get('/', function(req, res, next) {

  var pollsArray = [];
  var titlesArray = [];
    Polls.findPolls(function(data) {
        data.forEach(function(key) {
            if (key.id !== undefined) {
                pollsArray.push(key.id);
                titlesArray.push(key.title);
            }
        });
        res.render('index', {
            title: 'Welcome to FCC Voting App',
            data: pollsArray,
            pollsTitle: titlesArray
        });
    });
  });


router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', {user: req.user});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/'}), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    // req.flash('success', 'You have logged out');
    res.redirect('/')
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

// POLL HANDLERS

    // CREATE A NEW POLL AFTER LOGGEDIN
    router.get('/create',  loggedIn, function(req, res) {
        res.render('create');
    });


    router.post('/create',  function(req, res) {
        var formData = req.body;
        formData.user = req.user.username;


        Polls.createChartObject(formData, function(err, data) {
            if (err) {
                console.log(err);
            }
            console.log("Poll successfully inserted into database");
            res.redirect('/create');
        });

    });

    // FRONT PAGE POLL CREATION

    router.get('/poll/:id', function(req, res) {
        var id = req.params.id;
        Polls.findOnePoll(id, function(err, data) {
            console.log(data, "this is data");
            data.date = "";
              res.render('chart', {
                  poll: data
              });
        });
    });


    // POLL HANDLER FOR VOTING
    router.post('/poll/vote', function(req, res) {
        console.log("posting vote", req.body);
        var voterId;
        if (req.user) {
          voterId = req.user.username
        }
        var poll = req.body["poll_id"];
        var userIp = req.connection.remoteAddress;
        var itemChoice = req.body["poll_choice"];

        if (req.body.customOption) {
          var newVoteField = req.body.customOption;

            // Add new Option to the data base and update the colors, and votes array
            Polls.insertNewChoice(poll, newVoteField, userIp, voterId, function (err, msg) {
              if (err) {
                console.log("err", err);
                res.redirect('/');
              } else {
                console.log("msg", msg);
                res.redirect('/poll/' + poll);
              }
            });

        } else {
            Polls.updatePolls(voterId, poll, itemChoice, userIp, function(err, msg, data) {
                if (err) {
                    console.log(err);
                    console.log('msg', msg);
                    res.redirect('/');
                }
                console.log('msg', msg);
                res.redirect('/poll/' + poll);
            });
        }
    });

    // DELETE POLLS

    router.get('/dashboard', function (req, res) {
      var titlesArray = [];
      var pollsArray = [];

      if (req.user) {
        var id = req.user.username;
        Polls.findId(id, function (err, data) {
          if (err) {
            console.log("error", err);
          }
            data.forEach(function(key) {
                if (key.id !== undefined) {
                    pollsArray.push(key.id);
                    titlesArray.push(key.title);
                }
            });
          res.render('dashboard', {data: pollsArray, title: titlesArray});
          });
        } else {
          res.redirect('/');
        }
    });

    router.delete('/poll/delete/:id', function (req, res) {
      console.log("RUNNING THE DELETE CALL");
      var pollId = req.params.id;

      Polls.deletePoll(pollId, function (err, msg) {
        if (err) {
          console.log("error", err);
        }
        res.send({message: "Deleting Poll Success, Refreshing page"});
      });
    });

module.exports = router;

function loggedIn(req, res, next) {
    if (req.user) {
        res.locals.user = req.user;
        next();
    } else {
        res.redirect('/');
    }
}
