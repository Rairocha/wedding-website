const { Schema, model } = require('mongoose');

const party = new Schema({
    name: String,
    description: String,
    location: String,
    imageUrl: String,
    date: Date,
    time: String
  });

module.exports = model('Party', party);