import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full flex p-10 justify-center items-center bg-gradient-to-r from-orange-400 via-cyan-500 to-purple-600">
            <Link className="text-3xl font-bold mb-4 text-center text-white" href="/">PokéDex</Link>
        </header>
    )
}
