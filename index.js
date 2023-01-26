import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { getTrainer, postTrainer } from './services/trainer.js';
import { postPack, postEvolve } from './services/pokeCollection.js';
import { postPokemon } from './services/pokemon.js';

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("I'm connected to the DB!");
});

const checkBearerToken = (req, res, next) => {
  if (req.headers.authorization !== "Bearer moo") {
    return res.status(401).send('You are not allowed');
  }
  console.log('we did something');
  next();
};

app.get('/trainer/:id', getTrainer);
app.post('/trainer',  postTrainer);

// app.post('/pokemon', postPokemon);

app.post('/pokeCollection/pack', postPack);
app.post('/pokeCollection/evolve', postEvolve);

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`));
