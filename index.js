require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000;
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
const Trainer = require('./models/trainer');
const PokeCollection = require('./models/pokeCollection');

app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Im connected to the DB!');
});

app.get('/trainer/:id', async (req, res) => {
  const foundTrainer = await Trainer
    .findById(req.params.id)
    .populate({ path: 'pokecollection', populate: { path: 'trainer' }});
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
    pokemons: [1,2,3],
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

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`))
