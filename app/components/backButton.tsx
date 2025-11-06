'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="cursor-pointer mt-8 m-auto w-fit rounded-xs bg-green-700 hover:bg-green-900 px-4 py-2 text-white transition-all"
    >
      Volver atrás
    </button>
  )
}