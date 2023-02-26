import express from 'express';
import { postEvolve, postPack } from '../services/pokeCollection.js';

const pokeCollectionsRouter = express.Router();

pokeCollectionsRouter.post('/pack', postPack);
pokeCollectionsRouter.post('/evolve', postEvolve);

export default pokeCollectionsRouter;
