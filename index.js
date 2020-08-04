require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000;
const mongoose = require('mongoose');

const { getTrainer, postTrainer } = require('./services/trainer');
const postPokemon = require('./services/pokemon');
const { postPack, postEvolve } = require('./services/pokeCollection');

mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

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

app.get('/trainer/:id', checkBearerToken, getTrainer);
app.post('/trainer', checkBearerToken, postTrainer);

app.post('/pokemon', checkBearerToken, postPokemon);

app.post('/pokeCollection/pack', checkBearerToken, postPack);
app.post('/pokeCollection/evolve', checkBearerToken, postEvolve);

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`));
