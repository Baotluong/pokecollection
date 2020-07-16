require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000;
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
const Trainer = require('./models/trainer');
const PokeCollection = require('./models/pokeCollection');
const Pokemon = require('./models/pokemon');

app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Im connected to the DB!');
});

app.get('/trainer/:id', async (req, res) => {
  const foundTrainer = await Trainer
    .findById(req.params.id)
    .populate({ path: 'pokecollection', populate: [{ path: 'pokemons' }]});
  res.status(200).json(foundTrainer);
});

app.post('/trainer', async (req, res) => {
  if (!req.body.name) return res.status(400).send('Invalid Input.');
  const newTrainerId = new mongoose.Types.ObjectId();
  const newPokeCollectionId = new mongoose.Types.ObjectId();
  const newTrainer = new Trainer({
    _id: newTrainerId,
    name: req.body.name,
    currency: 1,
    pokecollection: newPokeCollectionId,
  });
  const newPokeCollection = new PokeCollection({
    _id: newPokeCollectionId,
    pokemons: [1, 1, 1],
    trainer: newTrainerId,
  });
  try {
    const newTrainerResult = await newTrainer.save();
    await newPokeCollection.save();
    res.status(200).json(newTrainerResult);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/pokemon', async (req, res) => {
  // Add all 150 pokemon to the db.
  // https://pokeapi.co/api/v2/evolution-chain/1/ *77 is mewtwo
  const id = 1
  const newPokemon = new Pokemon({
    _id: id,
    name: 'Bulbasaur',
    rarity: 0,
    // rarity = 2 - number of times it can still evolve
    evolvesTo: [2],
    // eeveee eeeeeeh
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  });
  try {
    await newPokemon.save();
    res.status(200).json(newPokemon);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`))
