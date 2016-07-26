var Poll = require('../models/chartdb');
var shortid = require('shortid');
var randomColor = require('randomcolor');

var exports = module.exports = {};

// Create the poll object
exports.createChartObject = function(object, callback) {

    var results = getPollData(object);
    var length = getPollDataLength(results);
    var colors = generateRandomColors(results);

    var data = {
        user: object.user,
        title: object.title,
        id: shortid.generate(),
        labels: results,
        votes: length,
        colors: colors
    }

    // Create & Save the Poll to MongoDB
    var poll = new Poll(data);

    poll.save(function(err, poll) {
        if (err) return console.error(err);
        callback(poll);
    });
}

// FIND Polls
exports.findPolls = function(callback) {
    Poll.find({}, function(err, data) {
        callback(data);
    });
}

exports.findId = function(id, callback) {

  Poll.find({"user": id}, "id title", function(err, data) {
    if (err) {
      console.error(err);
      callback(false, err);
    }
      callback(null, data);
  });
}


exports.findOnePoll = function(id, callback) {
    Poll.findOne({
        "id": id
    }, function(err, data) {
      if (err) {
        console.error(err);
        callback(false, err);
      }
        callback(null, data);
    });
}

// Update Polls

exports.updatePolls = function(user, pollId, itemChoice, userIp, callback) {
    Poll.findOne({
        "id": pollId
    }, function(err, data) {
        // Voter is present

        if (userChecker(userIp, user, data) === false) {
            callback(null, "You have already voted in the Poll")
        } else {
            // Voter not present

            // Add the voter to the DB
            var votersArray = UpdateVotersArray(userIp, user, data);

            // Update the array of votes
            var newVotesArray = createNewVotesArray(itemChoice, data);
            var newObj = {}
            newObj.votes = newVotesArray;
            newObj.voters = votersArray;

            Poll.update({
                "id": pollId
            }, {
                $set: newObj
            }, function(err, data) {
                console.log("error", err);
                console.log("data", data);
                callback(null, "Vote added successfully", data);
            });
      }
    });
};

exports.insertNewChoice = function (pollId, newField, userIp, user, callback) {

  Poll.findOne({
      "id": pollId
  }, function(err, data) {
      // Voter is present
      if (userChecker(userIp, user, data) === false) {
          console.log("You have already Voted, you cannot vote Iceeee")
          callback(null, "You have already voted in the Poll");
    } else {

      // Updating the arrays with new choice
      Poll.update({
        "id": pollId
      }, {$push: {
        "voters": user,
        "voters": userIp,
        "labels": newField,
        "votes": 1,
        "colors": randomColor()
      }}, function (err, data) {
        console.log('error', err);
        callback(null, "Poll updated sucessfully");
      });
    }
  });
}

exports.deletePoll = function (pollId, callback) {
  console.log("inside the delete call, pollId =", pollId);
    Poll.remove({"id": pollId}, function (err, data) {
      if (err) {
        console.log('error', err);
      }
        callback(null, data);
    });
  };

function getPollData(data) {

    var newArray = [];
    var result = Object.keys(data).forEach(function(key) {
        if (key === "title") {
            title = data[key];
        } else if (key === "user") {
            user = data[key];
        } else {
            newArray.push(data[key]);
        }
    });
    return newArray;
}

function getPollDataLength(data) {
    var voteArray = [];
    var length = data.length;
    for (var i = 0; i < length; i++) {
        voteArray.push(0);
    }
    return voteArray;
}

function generateRandomColors(data) {

    var length = data.length;
    var result = randomColor({
      count: length
    })
    return result;
}

function createNewVotesArray(itemChoice, pollObj) {
    var votesArray = pollObj.votes;
    votesArray[itemChoice] += 1;

    return votesArray;
}

function UpdateVotersArray(userIp, userUsername, pollObj) {
    var votersArray = pollObj.voters;
    if (userIp && !userUsername) {
      votersArray.push(userIp);
    } else {
      votersArray.push(userUsername, userIp);
    }
    return votersArray;
}

function userChecker(userIp, userName, obj) {
    var votersArray = obj.voters;

    if (votersArray.length < 1) {
      return true;
    } else if (votersArray.indexOf(userName) !== -1) {
      return false;
    } else if (votersArray.indexOf(userName) === -1 && votersArray.indexOf(userIp) > 0) {
      return true;
    } else if (votersArray.indexOf(userIp) !== -1) {
      return false;
    }

}
