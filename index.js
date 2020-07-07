const express = require('express')
const app = express()
const port = 3000;
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Im connected to the DB!');
});

const cowSchema = new mongoose.Schema({
  name: String,
  email: String,
  numberSpots: Number,
});

const Cow = mongoose.model('Cow', cowSchema);

app.get('/*', (req, res, next) => {
  console.log('im here')
  // res.send('hi')
  next()
})
app.get('/moo/', (req, res) => {
  const newCow = new Cow({ name: 'BaoCow', email: 'BaoCow@moo.com', numberSpots: 1 });
  newCow.save();
  res.status(201).send('Cow Created!');
})
app.get('/find', async (req, res) => {
  const foundCow = await Cow.findOneAndUpdate({ name: 'BaoCow2'} , { numberSpots: 3, email: 'moo@moo.com' }, { upsert: true })
    .then((result) => {
      console.log(result);
      return result
    });
  res.json(foundCow)
})
app.get('/delete', async (req, res) => {
  const foundCow = await Cow.deleteMany({ name: 'BaoCow'})
    .then((result) => {
      console.log(result);
      return result
    });
  res.json(foundCow)
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
