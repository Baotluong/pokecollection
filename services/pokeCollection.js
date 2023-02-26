import { StatusCodes } from 'http-status-codes/build/cjs/status-codes.js';
import Pokemon from '../models/pokemon.js';
import Trainer from '../models/trainer.js';
import { NUM_REQUIRED_TO_EVOLVE, PACK_TYPES } from '../shared/constants.js';
import { selectRandomPokemon } from '../shared/functions.js';

export const postPack = async (req, res) => {
  try {
    const trainerId = req.body.trainerId;

    if (!req.body.packType) return res.status(StatusCodes.BAD_REQUEST).send('Pack type is not available.');

    const packType = req.body.packType.trim().toLowerCase();
    const pack = PACK_TYPES[packType];

    if (!pack) return res.status(StatusCodes.BAD_REQUEST).send('Pack type is not available.');
    if (!trainerId) return res.status(StatusCodes.BAD_REQUEST).send('No trainer id supplied.');

    const foundTrainer = await Trainer
      .findById(trainerId)
      .populate({ path: 'pokecollection' });

    if (!foundTrainer) return res.status(StatusCodes.BAD_REQUEST).send('No trainer found for that id.');

    if (foundTrainer.currency < pack.cost) {
      return res.status(StatusCodes.PAYMENT_REQUIRED).send('Trainer does not have enough currency.');
    }

    const allPokemon = await Pokemon.find();
    const rares = allPokemon.filter(pokemon => pokemon.rarity === 2)
    const uncommons = allPokemon.filter(pokemon => pokemon.rarity === 1)
    const commons = allPokemon.filter(pokemon => pokemon.rarity === 0)

    const selectedRandomPokemon =
      selectRandomPokemon(rares, pack.raresPerPack)
        .concat(selectRandomPokemon(uncommons, pack.uncommonsPerPack))
        .concat(selectRandomPokemon(commons, pack.commonsPerPack));

    foundTrainer.currency -= pack.cost;
    selectedRandomPokemon.forEach(pokemon => {
      foundTrainer.pokecollection.pokemons.push(pokemon._id);
    });

    await foundTrainer.pokecollection.save();
    await foundTrainer.save();

    res.status(StatusCodes.OK).json(selectedRandomPokemon);
  } catch (error) {
    next(error);
  }
};

export const postEvolve = async (req, res) => {
  try {
    const pokemonToEvolveId = req.body.pokemonToEvolveId;
    const trainerId = req.body.trainerId;

    if (!trainerId) return res.status(StatusCodes.BAD_REQUEST).send('No trainer id supplied.');
    if (!pokemonToEvolveId) return res.status(StatusCodes.BAD_REQUEST).send('No Pokemon id supplied.');

    const foundPokemonToEvolve = await Pokemon
      .findById(pokemonToEvolveId);
    if (!foundPokemonToEvolve) return res.status(StatusCodes.BAD_REQUEST).send('No Pokemon found for that id.');
    if (!foundPokemonToEvolve.evolvesTo.length) {
      return res.status(StatusCodes.BAD_REQUEST).send('This pokemon does not evolve.');
    }

    const foundTrainer = await Trainer
      .findById(trainerId)
      .populate({ path: 'pokecollection' });
    if (!foundTrainer) return res.status(StatusCodes.BAD_REQUEST).send('No trainer found for that id.');

    const pokemonCollection = foundTrainer.pokecollection.pokemons;

    let numOfTimesFound = 0;
    for (let i = 0; i < pokemonCollection.length; i++) {
      if (pokemonCollection[i] === pokemonToEvolveId) {
        numOfTimesFound++;
        pokemonCollection.splice(i, 1);
        i--;
        if (numOfTimesFound >= NUM_REQUIRED_TO_EVOLVE) {
          break;
        }
      }
    }

    if (numOfTimesFound < NUM_REQUIRED_TO_EVOLVE) {
      return res.status(StatusCodes.BAD_REQUEST).send('Not enough pokemon to evolve.');
    }

    const evolvedPokemonId = foundPokemonToEvolve.evolvesTo.length === 1 ?
      foundPokemonToEvolve.evolvesTo[0] :
      selectRandomPokemon(foundPokemonToEvolve.evolvesTo, 1)[0];
    pokemonCollection.push(evolvedPokemonId);

    await foundTrainer.pokecollection.save();
    const evolvedPokemon = await Pokemon.findById(evolvedPokemonId);
    res.status(StatusCodes.OK).json(evolvedPokemon);
  } catch (error) {
    next(error);
  }
};
