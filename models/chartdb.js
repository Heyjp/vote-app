var mongoose = require('mongoose');

var pollSchema = {
        user: String,
        title: String,
        id: String,
        labels: [String],
        votes: [Number],
        voters: [String],
        colors: [String]
    };

var Polls = module.exports = mongoose.model('Polls', pollSchema);
