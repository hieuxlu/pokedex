import axios from "axios";
import { capitalize } from "lodash-es";

const BASE_URL = "https://pokeapi.co/api/v2";
const client = axios.create({
  baseURL: BASE_URL,
});

export const getPokemon = async (name: string) => {
  const { data } = await client.get(`/pokemon/${name}`);

  return data;
};

export const getPokemonSpecies = async (id: string | number) => {
  const { data } = await client.get(`/pokemon-species/${id}`);

  return data;
};

export const getEvolutionChain = async (url: string) => {
  const { data } = await axios.get(url);

  return data;
};

export const initAssets = async () => {
  const {
    data: { results: pokemonList },
  } = await client.get("/pokemon?limit=151");

  const result = await Promise.all(
    pokemonList.map(async (item) => {
      const name = capitalize(item.name);
      const pokemon = await getPokemon(name);
      const species = await getPokemonSpecies(name);
      let evolutionChain = species.evolution_chain;

      if (species.evolution_chain.url) {
        evolutionChain = await getEvolutionChain(species.evolution_chain.url);
      }

      await Promise.all([
        axios.get(pokemon.sprites.front_default), 
        axios.get(pokemon.sprites.other.home.front_default)
      ]);

      return { pokemon, species, evolutionChain };
    })
  );

  return result;
};
