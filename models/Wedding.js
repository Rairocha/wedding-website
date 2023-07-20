const { Schema, model } = require('mongoose');

const wedding = new Schema({
    name: String,
    description: String,
    imageUrl: String,
    location: String,
    date: Date,
    time: String,
    owner: [{ type: Schema.Types.ObjectId, ref: "User" }],
    guests: [{type: String}],
    totalGift: {type: Number, default:0}
  });

module.exports = model('Wedding', wedding);