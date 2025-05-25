import dynamic from "next/dynamic"
import { Suspense } from "react"

const PhilosophyOrbSpiral = dynamic(() => import("@/components/PhilosophyOrbSpiral"), { ssr: false })

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading...</div>}>
        <PhilosophyOrbSpiral />
      </Suspense>
    </main>
  )
}
