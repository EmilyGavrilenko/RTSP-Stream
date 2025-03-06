import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import CarsCrossed from "./components/CarsCrossed"
import LineValues from "./components/LineValues"
import RecentRows from "./components/RecentRows"
import RangeSelector from "./components/RangeSelector"
import ClientImage from '@/components/ClientImage'

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {


  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full text-center mb-8">
        <h1 className="text-4xl font-bold">Traffic Monitor</h1>
        <h2 className="text-xl text-gray-600 mt-2">Geary Street</h2>
      </div>
      <ClientImage />
      <div className="container mx-auto px-4 py-8">

        <div key="static-components">
          <div className="mb-8">
            <Suspense fallback={<div>Loading cars crossed...</div>}>
              <CarsCrossed searchParams={searchParams as any} />
            </Suspense>
          </div>

          <div className="mb-8">
            <Suspense fallback={<div>Loading line values...</div>}>
              <LineValues />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<div>Loading recent rows...</div>}>
              <RecentRows />
            </Suspense>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/about" 
          className="text-blue-500 hover:text-blue-600 text-lg font-medium"
        >
          Learn how we built this →
        </Link>
      </div>
    </main>
  )
}

