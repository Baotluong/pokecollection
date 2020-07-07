const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: String,
  currency: Number,
  pokecollection: String,
});

const Trainer = mongoose.model('trainer', trainerSchema);

module.exports = Trainer;
