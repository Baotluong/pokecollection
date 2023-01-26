import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const pokeCollectionSchema = new Schema({
  _id: Schema.Types.ObjectId,
  pokemons: [{
    type: Number, ref: 'Pokemon'
  }],
  trainer: {
    type: Schema.Types.ObjectId, ref: 'Trainer'
  },
});

const PokeCollection = mongoose.model('PokeCollection', pokeCollectionSchema);

export default PokeCollection;
