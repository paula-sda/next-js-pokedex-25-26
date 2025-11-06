import Link from "next/link";
import Image from "next/image";

export default function EvolutionChain({id, evolutions} : {id:number; evolutions: { name: string; id: number }[]}) {
    return (<>
        {evolutions.length > 1 && (
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Cadena Evolutiva</h2>
                <div className="flex gap-4 justify-center items-center flex-wrap">
                    {evolutions.map((evolution, index) => (
                        <div key={evolution.id} className="flex items-center gap-2">
                            <Link
                                href={`/pokemon/${evolution.id}`}
                                className={`flex flex-col items-center p-4 rounded-lg transition-all ${evolution.id === parseInt(id.toString())
                                        ? 'bg-blue-700 ring-2 ring-blue-400'
                                        : 'bg-slate-800 hover:bg-slate-700'
                                    }`}
                            >
                                <Image
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`}
                                    alt={evolution.name}
                                    width={96}
                                    height={96}
                                />
                                <p className="capitalize text-center mt-2">{evolution.name}</p>
                            </Link>
                            {index < evolutions.length - 1 && (
                                <span className="text-2xl">→</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </>)
}