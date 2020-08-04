const Trainer = require('../models/trainer');
const Pokemon = require('../models/pokemon');
const { PACK_TYPES, NUM_REQUIRED_TO_EVOLVE } = require('../shared/constants');
const { selectRandomPokemon } = require('../shared/functions');

const postPack = async (req, res) => {
  const trainerId = req.body.trainerId;
  const packType = req.body.packType.trim().toLowerCase();
  const pack = PACK_TYPES[packType];

  if (!pack) return res.status(400).send('Pack type is not available.');
  if (!trainerId) return res.status(400).send('No trainer id supplied.');

  const foundTrainer = await Trainer
    .findById(trainerId)
    .populate({ path: 'pokecollection' });
  
  if (!foundTrainer) return res.status(400).send('No trainer found for that id.');

  if (foundTrainer.currency < pack.cost) {
    return res.status(402).send('Trainer does not have enough currency.');
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
  
  res.status(200).json(selectedRandomPokemon);
};

const postEvolve = async (req, res) => {
  const pokemonToEvolveId = req.body.pokemonToEvolveId;
  const trainerId = req.body.trainerId;

  if (!trainerId) return res.status(400).send('No trainer id supplied.');
  if (!pokemonToEvolveId) return res.status(400).send('No Pokemon id supplied.');

  const foundPokemonToEvolve = await Pokemon
    .findById(pokemonToEvolveId);
  if (!foundPokemonToEvolve) return res.status(400).send('No Pokemon found for that id.');
  if (!foundPokemonToEvolve.evolvesTo.length) {
    return res.status(400).send('This pokemon does not evolve.');
  }

  const foundTrainer = await Trainer
    .findById(trainerId)
    .populate({ path: 'pokecollection' });
  if (!foundTrainer) return res.status(400).send('No trainer found for that id.');

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
    return res.status(400).send('Not enough pokemon to evolve.');
  }

  const evolvedPokemon = foundPokemonToEvolve.evolvesTo.length === 1 ?
    foundPokemonToEvolve.evolvesTo[0] :
    selectRandomPokemon(foundPokemonToEvolve.evolvesTo, 1)[0];
  pokemonCollection.push(evolvedPokemon);
  
  await foundTrainer.pokecollection.save();
  res.status(200).json(evolvedPokemon);
};

module.exports = {
  postPack,
  postEvolve,
};
