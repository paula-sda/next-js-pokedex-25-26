import { PokemonDetailPageProps } from "@/app/interfaces/pokemon";
import { getPokemonById } from "@/app/utils/get-pokemon-by-id";
import Image from "next/image";

export default async function Detail({ params }: PokemonDetailPageProps) {
    const parameters = await params;
    const id = parameters.id;
    const pokemonData = await getPokemonById(id);

    return (
        <main className="container mx-auto p-7 max-w-7xl">
            <h1 className="text-3xl font-bold mb-4 text-center capitalize">{pokemonData?.name}</h1>
            <div className="relative" style={{height: "200px"}}>
                <Image priority src={pokemonData?.sprites.front_default || ''} alt={pokemonData?.name || 'Pokemon image'} fill style={{ objectFit: "contain" }}/>
            </div>
        </main>
    )
}