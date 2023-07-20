const { Schema, model } = require('mongoose');

const gift = new Schema({
    name: String,
    description:String,
    price: Number,
    imageUrl: String,
    quantity: Number,
    availableAmount: Number,
    wedding:{ type: Schema.Types.ObjectId, ref: "Wedding" },
    buyers:[{type: Schema.Types.ObjectId, ref:"User"}]
  });

module.exports = model("Gift", gift);