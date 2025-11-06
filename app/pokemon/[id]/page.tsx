import BackButton from "@/app/components/backButton";
import DetailsCard from "@/app/components/detailsCard";
import { PokemonDetailPageProps } from "@/app/interfaces/pokemon";
import { getEvolutionChain, parseEvolutionChain } from "@/app/utils/get-evolution-chain";
import { getPokemonById } from "@/app/utils/get-pokemon-by-id";

export default async function Detail({ params }: PokemonDetailPageProps) {
    const { id } = await params;
    const pokemonData = await getPokemonById(id);

    const evolutionChainData = pokemonData?.species?.url
        ? await getEvolutionChain(pokemonData.species.url)
        : null;

    const evolutions = evolutionChainData
        ? parseEvolutionChain(evolutionChainData.chain)
        : [];

    return (
        <main className="container mx-auto p-7 max-w-7xl flex flex-col align-center justify-center">
            {pokemonData ? <DetailsCard pokemonData={pokemonData} evolutions={evolutions} /> : <>Cargando...</>}
            <BackButton />
        </main>
    )
}