const { Schema, model } = require('mongoose');

const wedding = new Schema({
    name: String,
    description: String,
    imageUrl: String,
    location: String,
    date: Date,
    time: String,
    owner: [{ type: Schema.Types.ObjectId, ref: "User" }]
  });

module.exports = model('Wedding', wedding);