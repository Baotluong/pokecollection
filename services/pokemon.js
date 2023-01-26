import fetch from "node-fetch";

import Pokemon from "../models/pokemon.js";

export const postPokemon = async (req, res) => {
  try {
    for (let eChain = 1; eChain <= 77; eChain++) {
      const data = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${eChain}/`)
        .then(res => res.json())
      let rareCount = 0;
  
      const processPokemon = async (pokemon) => {
        const id = pokemon.species.url.split('/')[6];
        const name = pokemon.species.name;
        let rarity = rareCount;
        const gen1Evolutions = pokemon.evolves_to.filter(evolution => {
          return Number.parseInt(evolution.species.url.split('/')[6]) <= 150;
        });
        const evolvesTo = gen1Evolutions.map(evolution => {
          return evolution.species.url.split('/')[6];
        });
        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        if (Number.parseInt(id) <= 150) {
          if (!gen1Evolutions.length && rarity === 0) rarity = 2;
          const newPokemon = new Pokemon({
            _id: id, name, rarity, evolvesTo, sprite,
          });
          await newPokemon.save();
          rareCount++;
        }
        gen1Evolutions.forEach(evolution => {
          processPokemon(evolution);
        });
      }
      processPokemon(data.chain);
    }
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};
