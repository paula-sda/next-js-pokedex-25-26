'use client';
import { PokemonDetail } from "../interfaces/pokemon";
import EvolutionChain from "./detailsCard/evolutionChain";
import DetailImage from "./detailsCard/detailImage";
import DetailAudio from "./detailsCard/detailAudio";
import DetailTypes from "./detailsCard/detailTypes";
import { usePokemonViewer } from "../hooks/usePokemonViewer";

export default function DetailsCard({ pokemonData, evolutions }: { pokemonData: PokemonDetail; evolutions: { name: string; id: number }[] }) {
    const {
        currentImage,
        audioRef,
        toggleOrientation,
        toggleShiny,
        playAudio
    } = usePokemonViewer(pokemonData.sprites);


    return (
        <>
            <h1 className="text-3xl font-bold mb-4 text-center capitalize text-purple-400">{pokemonData.name}</h1>
            <DetailImage image={currentImage} name={pokemonData.name} toggleOrientation={toggleOrientation} />
            <DetailAudio audioRef={audioRef} cry={pokemonData.cries.latest} playAudio={playAudio} toggleShiny={toggleShiny} />
            <DetailTypes types={pokemonData.types} />
            <EvolutionChain id={pokemonData.id} evolutions={evolutions} />
        </>
    )
}
