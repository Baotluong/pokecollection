const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trainerSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  currency: Number,
  pokecollection: {
    type: Schema.Types.ObjectId,
    ref: 'PokeCollection'
  },
});

const Trainer = mongoose.model('Trainer', trainerSchema);

module.exports = Trainer;
