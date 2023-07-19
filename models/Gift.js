const { Schema, model } = require('mongoose');

const gift = new Schema({
    imageURL: String,
    name: String,
    price: Number,
    wedding:{ type: Schema.Types.ObjectId, ref: "Wedding" }
  });

module.exports = model("Gift", gift);