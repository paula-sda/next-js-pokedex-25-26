import { Pokemon, PokemonListPageProps } from "./interfaces/pokemon";
import { getPokemonList } from "./utils/get-pokemon-list";
import { calculatePokemonNumber } from "./utils/pokemon-number";
import Card from "./components/card";
import Pagination from "./components/pagination";
import { pokemonPerPage } from "./constants/listing.constants";

export default async function Home({ searchParams }: PokemonListPageProps) {
  const { page } = await searchParams;
  const currentPage = await Number(page) || 1;

  const pokemonData = await getPokemonList(currentPage);
  const pokemonList = pokemonData?.results || [];

  const totalPokemon = pokemonData?.count || 0;
  const totalPages = Math.ceil(totalPokemon / pokemonPerPage);

  return (
    <div className="container mx-auto p-7 max-w-7xl">
      <div className="grid grid-cols-3 gap-4 justify-center items-center">
        {
          pokemonList.map((pokemon: Pokemon, index: number) => (
            <Card pokemonIndex={calculatePokemonNumber(currentPage, index)} pokemonName={pokemon.name} key={index} />
          ))
        }
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
