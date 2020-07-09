const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pokeCollectionSchema = new Schema({
  _id: Schema.Types.ObjectId,
  pokemons: [Number],
  trainer: {
    type: Schema.Types.ObjectId, ref: 'Trainer'
  },
});

const PokeCollection = mongoose.model('PokeCollection', pokeCollectionSchema);

module.exports = PokeCollection;
