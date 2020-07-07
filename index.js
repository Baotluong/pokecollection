require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000;
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
const Trainer = require('./models/trainer');

app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Im connected to the DB!');
});

app.get('/trainer/:id', async (req, res) => {
  const foundTrainer = await Trainer.findById(req.params.id);
  res.status(200).json(foundTrainer);
});

app.post('/trainer', (req, res) => {
  if (!req.body.name) return res.status(400).send('Invalid Input.');
  const newTrainer = new Trainer({ name: req.body.name, currency: 1, pokecollection: 'placeholder' });
  newTrainer.save((err, doc) => {
    if (err) {
      res.status(500).end(err);
    } else {
      res.status(201).json(doc);
    }
  });
});

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`))
