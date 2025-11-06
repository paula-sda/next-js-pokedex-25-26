import { PokemonData } from "../interfaces/pokemon";
import { pokemonPerPage } from "../constants/listing.constants"

export async function getPokemonList(page = 1) {
    const offset = (page - 1) * pokemonPerPage;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=${offset}`);

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