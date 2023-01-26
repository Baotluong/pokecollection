import express from 'express';
import { postPack, postEvolve } from '../services/pokeCollection.js';

const pokeCollectionsRouter = express.Router();

pokeCollectionsRouter.post('/pack', postPack);
pokeCollectionsRouter.post('/evolve', postEvolve);

export default pokeCollectionsRouter;
