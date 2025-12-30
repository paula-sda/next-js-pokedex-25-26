'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="cursor-pointer mt-8 m-auto w-fit rounded-xs bg-cyan-400 hover:bg-cyan-600 px-4 py-2 text-black transition-all"
    >
      Volver atrás
    </button>
  )
}