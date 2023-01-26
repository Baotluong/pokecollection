export const selectRandomPokemon = (collection, numberOfSelections) => {
  const selectedPokemon = [];
  for (let i = 0; i < numberOfSelections; i++) {
    const randomPokemon = collection[Math.floor(Math.random() * collection.length)];
    selectedPokemon.push(randomPokemon);
  }
  return selectedPokemon;
}
