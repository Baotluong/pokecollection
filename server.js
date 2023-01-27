import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';

import trainersRouter from './routes/trainers.js';
import pokeCollectionsRouter from './routes/pokeCollections.js';

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("I'm connected to the DB!");
});

app.use('/trainer', trainersRouter);
app.use('/pokeCollection', pokeCollectionsRouter);

// app.post('/pokemon', postPokemon);

app.listen(port, () => console.log(`PokeCollection app listening at http://localhost:${port}`));
