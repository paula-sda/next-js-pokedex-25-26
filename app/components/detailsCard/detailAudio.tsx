import { RefObject } from "react";

export default function DetailAudio({ audioRef, cry, playAudio, toggleShiny }: { audioRef: RefObject<HTMLAudioElement | null>, cry: string, playAudio: () => void, toggleShiny: () => void }) {
    return (
        <div className="flex gap-8 m-auto w-fit">
            <audio ref={audioRef} className="hidden" src={cry}></audio>
            <button className="cursor-pointer px-4 py-2 bg-green-600 rounded-xs hover:bg-green-800" onClick={playAudio}>🔊</button>
            <button className="cursor-pointer px-4 py-2 bg-pink-600 rounded-xs hover:bg-pink-700" onClick={toggleShiny}>✨</button>
        </div>
    )
}