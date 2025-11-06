'use client';
import Image from "next/image";
import { PokemonDetail } from "../interfaces/pokemon";
import { useRef, useState } from "react";
import { TYPE_COLORS, TYPE_TRANSLATIONS } from "../constants/types";
import EvolutionChain from "./evolutionChain";

export default function DetailsCard({ pokemonData, evolutions }: { pokemonData: PokemonDetail; evolutions: { name: string; id: number }[] }) {
    const [isShiny, setIsShiny] = useState(false);
    const [isFront, setIsFront] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);

    const changeOrientation = () => {
        setIsFront(prev => !prev);
    };

    const toggleShiny = () => {
        setIsShiny(prev => !prev);
    };

    let imageSrc;
    if (isShiny) {
        imageSrc = isFront ? pokemonData.sprites.front_shiny : pokemonData.sprites.back_shiny;
    } else {
        imageSrc = isFront ? pokemonData.sprites.front_default : pokemonData.sprites.back_default;
    }

    const finalImageSrc = imageSrc || pokemonData.sprites.front_default;

    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    }

    return (
        <>
            <h1 className="text-3xl font-bold mb-4 text-center capitalize">{pokemonData.name}</h1>
            <div className="relative flex items-center justify-center mb-5" style={{ height: "200px" }}>
                <button onClick={changeOrientation} className="relative w-3xs rounded-xl h-full cursor-pointer hover:bg-gray-900">
                    <Image priority sizes="50vw" src={finalImageSrc} alt={pokemonData.name} fill style={{ objectFit: "contain" }} />
                </button>
            </div>
            <div className="flex gap-8 m-auto w-fit">
                <audio ref={audioRef} className="hidden" src={pokemonData.cries.latest}></audio>
                <button className="cursor-pointer px-4 py-2 bg-emerald-700 rounded-xs hover:bg-emerald-800" onClick={playAudio}>🔊</button>
                <button className="cursor-pointer px-4 py-2 bg-purple-700 rounded-xs hover:bg-purple-800" onClick={toggleShiny}>✨</button>
            </div>
            <div className="py-4 flex gap-6 m-auto w-fit">
                {pokemonData.types.map((typeInfo, index) => (
                    <span className="px-4 py-2 rounded-full" style={{ 'background': TYPE_COLORS[typeInfo.type.name] }} key={index}>{TYPE_TRANSLATIONS[typeInfo.type.name]}</span>
                ))}
            </div>
                <EvolutionChain id={pokemonData.id} evolutions={evolutions} />

        </>
    )
}
