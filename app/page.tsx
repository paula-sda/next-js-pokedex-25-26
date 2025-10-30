import Link from "next/link";
import { Pokemon, PokemonListPageProps } from "./interfaces/pokemon";
import { getPokemonList } from "./utils/get-pokemon-list";
import { calculatePokemonNumber } from "./utils/pokemon-number";
import Card from "./components/card";

export default async function Home({ searchParams }: PokemonListPageProps) {
  const params = await searchParams;
  const currentPage = await Number(params.page) || 1;

  const pokemonData = await getPokemonList(currentPage);
  const pokemonList = pokemonData?.results || [];

  // Comprobamos si tiene página siguiente y anterior
  const hasPreviousPage = pokemonData?.previous;
  const hasNextPage = pokemonData?.next;

  return (
    <div className="container mx-auto p-7 max-w-7xl">
      <h1 className="text-3xl font-bold mb-4 text-center">PokéDex</h1>
      <div className="grid grid-cols-3 gap-4 justify-center items-center">
        {
          pokemonList.map((pokemon: Pokemon, index: number) => (
            <Card pokemonIndex={calculatePokemonNumber(currentPage, index)} pokemonName={pokemon.name} key={index} />
          ))
        }
      </div>
      <div className="flex gap-4 justify-center items-center mt-3">
        {
          hasPreviousPage ?
            (<Link href={`/?page=${currentPage - 1}`} className="px-4 py-2 bg-blue-300 text-black rounded-4xl">Anterior</Link>)
            : (<></>)
        }
        {
          hasNextPage ?
            (<Link href={`/?page=${currentPage + 1}`} className="px-4 py-2 bg-blue-300 text-black rounded-4xl">Siguiente</Link>)
            : (<></>)
        }
      </div>
    </div>
  );
}
