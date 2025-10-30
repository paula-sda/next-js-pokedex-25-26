import { PokemonData } from "../interfaces/pokemon";

export async function getPokemonList(page = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);

        if (!response.ok) {
            throw new Error('Error al obtener la lista de Pokémon');
        }

        const data = await response.json();
        const pokemonData: PokemonData = data;

        return pokemonData;
    } catch (error) {
        console.error(error);
        return null;
    }
}