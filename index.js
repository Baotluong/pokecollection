require('dotenv').config();
const express = require('express')
const fetch = require("node-fetch");
const app = express()
const port = 3000;
const mongoose = require('mongoose');
const Trainer = require('./models/trainer');
const PokeCollection = require('./models/pokeCollection');
const Pokemon = require('./models/pokemon');

const packTypes = {
  basic: {
    cost: 1,
    raresPerPack: 1,
    uncommonsPerPack: 2,
    commonsPerPack: 3,
  },
  premium: {
    cost: 2,
    raresPerPack: 3,
    uncommonsPerPack: 2,
    commonsPerPack: 1,
  }
}

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

// build functionality to purchase multiple packs

app.post('/pack', async (req, res) => {
  const trainerId = req.body.trainer;
  const packType = req.body.packType.trim().toLowerCase();
  const pack = packTypes[packType];
  if (!pack) {
    return res.status(400).send('Pack type is not available.');
  }

  if (!trainerId) {
    return res.status(400).send('No trainer id supplied.');
  }

  const foundTrainer = await Trainer
    .findById(trainerId)
    .populate({ path: 'pokecollection' });
  
  if (!foundTrainer) {
    return res.status(400).send('No trainer found for that id.');
  }

  if (foundTrainer.currency < pack.cost) {
    return res.status(402).send('Trainer does not have enough currency.');
  }

  const allPokemon = await Pokemon.find({});
  
  const rares = allPokemon.filter(pokemon => pokemon.rarity === 2)
  const uncommons = allPokemon.filter(pokemon => pokemon.rarity === 1)
  const commons = allPokemon.filter(pokemon => pokemon.rarity === 0)

  let newPack = []

  for (let i = 0; i < pack.raresPerPack; i++) {
    const randomRarePokemon = rares[Math.floor(Math.random() * rares.length)];
    foundTrainer.pokecollection.pokemons.push(randomRarePokemon._id);
    const { name, rarity, sprite } = randomRarePokemon
    newPack.push( {name, rarity, sprite} )
  }

  for (let i = 0; i < pack.uncommonsPerPack; i++) {
    const randomUncommonPokemon = uncommons[Math.floor(Math.random() * uncommons.length)];
    foundTrainer.pokecollection.pokemons.push(randomUncommonPokemon._id);
    const { name, rarity, sprite } = randomUncommonPokemon
    newPack.push( {name, rarity, sprite } )
  }

  for (let i = 0; i < pack.commonsPerPack; i++) {
    const randomCommonPokemon = commons[Math.floor(Math.random() * commons.length)];
    foundTrainer.pokecollection.pokemons.push(randomCommonPokemon._id);
    const { name, rarity, sprite } = randomCommonPokemon
    newPack.push( { name, rarity, sprite } )
  }

  foundTrainer.currency -= pack.cost;

  await foundTrainer.pokecollection.save();
  await foundTrainer.save();
  
  res.status(200).json(newPack);
});

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`))
