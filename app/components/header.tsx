import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full flex p-10 bg-slate-800 justify-center items-center">
            <Link className="text-3xl font-bold mb-4 text-center" href="/">PokéDex</Link>
        </header>
    )
}