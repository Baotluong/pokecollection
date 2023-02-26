import express from 'express';
import { getTrainer, postTrainer } from '../services/trainer.js';

const trainersRouter = express.Router();

trainersRouter.get('/:id', getTrainer);
trainersRouter.post('/',  postTrainer);

export default trainersRouter;
