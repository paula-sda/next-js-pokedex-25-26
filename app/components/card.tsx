import Link from "next/link";
import Image from "next/image";

export default function Card({ pokemonIndex, pokemonName }: { pokemonIndex: number; pokemonName: string }) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonIndex}.png`;
  
  return (
    <Link href={`/pokemon/${pokemonIndex}`}   className="flex flex-col justify-center items-center p-4 rounded-2xl bg-slate-800" >
      <img src={imageUrl} alt={pokemonName} width={128} height={128}  />
      <p className="capitalize text-center">{pokemonName}</p>
    </Link>
  );
}