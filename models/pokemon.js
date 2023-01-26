import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const pokemonSchema = new Schema({
  _id: Number,
  name: String,
  rarity: Number,
  evolvesTo: [Number],
  sprite: String,
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
