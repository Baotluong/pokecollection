import express from 'express';
import { getTrainer } from '../services/trainer.js';
import { postTrainer } from '../services/trainer.js';

const trainersRouter = express.Router();

trainersRouter.get('/:id', getTrainer);
trainersRouter.post('/',  postTrainer);

export default trainersRouter;
