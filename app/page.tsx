import { PokemonListPageProps } from "./interfaces/pokemon";
import { getPokemonList } from "./utils/get-pokemon-list";
import Pagination from "./components/home/pagination";
import { pokemonPerPage } from "./constants/listing.constants";
import PokemonGrid from "./components/home/pokemonGrid";

export default async function Home({ searchParams }: PokemonListPageProps) {
  const { page } = await searchParams;
  const currentPage = await Number(page) || 1;

  const pokemonData = await getPokemonList(currentPage);
  const pokemonList = pokemonData?.results || [];

  const totalPokemon = pokemonData?.count || 0;
  const totalPages = Math.ceil(totalPokemon / pokemonPerPage);

  return (
    <div className="container mx-auto p-7 max-w-7xl">
      <PokemonGrid pokemonList={pokemonList} currentPage={currentPage} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
