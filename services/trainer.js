import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';

import Trainer from '../models/trainer.js';
import PokeCollection from '../models/pokeCollection.js';

export const getTrainer = async (req, res) => {
  const foundTrainer = await Trainer
    .findById(req.params.id)
    .populate({ path: 'pokecollection', populate: [{ path: 'pokemons' }] });
  res.status(StatusCodes.OK).json(foundTrainer);
};

export const postTrainer = async (req, res) => {
  if (!req.body.name) return res.status(StatusCodes.BAD_REQUEST).send('Invalid Input.');
  const newTrainerId = new mongoose.Types.ObjectId();
  const newPokeCollectionId = new mongoose.Types.ObjectId();
  const newTrainer = new Trainer({
    _id: newTrainerId,
    name: req.body.name,
    currency: 50,
    pokecollection: newPokeCollectionId,
  });
  const newPokeCollection = new PokeCollection({
    _id: newPokeCollectionId,
    pokemons: [],
    trainer: newTrainerId,
  });
  try {
    const newTrainerResult = await newTrainer.save();
    await newPokeCollection.save();
    res.status(StatusCodes.OK).json(newTrainerResult);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};
