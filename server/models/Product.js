const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricePerUnit: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, enum: ['Fruit', 'Vegetable'] },
});

module.exports = mongoose.model('Product', ProductSchema);