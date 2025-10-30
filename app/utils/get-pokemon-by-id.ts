import { PokemonDetail } from "../interfaces/pokemon";

export async function getPokemonById (id: string) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

        if (!response.ok) {
            return null;
        }

        const data: PokemonDetail = await response.json();
        return data;
    } catch(error) {
        console.error(error);
        return null;
    }
}