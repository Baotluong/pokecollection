require('dotenv').config();
const express = require('express')
const fetch = require("node-fetch");
const app = express()
const port = 3000;
const mongoose = require('mongoose');
const Trainer = require('./models/trainer');
const PokeCollection = require('./models/pokeCollection');
const Pokemon = require('./models/pokemon');

mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Im connected to the DB!');
});

app.get('/trainer/:id', async (req, res) => {
  const foundTrainer = await Trainer
    .findById(req.params.id)
    .populate({ path: 'pokecollection', populate: [{ path: 'pokemons' }] });
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
  try {
    for (let eChain = 1; eChain <= 77; eChain++) {
      const data = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${eChain}/`)
        .then(res => res.json())
      let rareCount = 0;
  
      const processPokemon = async (pokemon) => {
        const id = pokemon.species.url.split('/')[6];
        const name = pokemon.species.name;
        let rarity = rareCount;
        const gen1Evolutions = pokemon.evolves_to.filter(evolution => {
          return Number.parseInt(evolution.species.url.split('/')[6]) <= 150;
        });
        const evolvesTo = gen1Evolutions.map(evolution => {
          return evolution.species.url.split('/')[6];
        });
        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        if (Number.parseInt(id) <= 150) {
          if (!gen1Evolutions.length && rarity === 0) rarity = 2;
          const newPokemon = new Pokemon({
            _id: id, name, rarity, evolvesTo, sprite,
          });
          await newPokemon.save();
          rareCount++;
        }
        gen1Evolutions.forEach(evolution => {
          processPokemon(evolution);
        });
      }
      processPokemon(data.chain);
    }
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`))
