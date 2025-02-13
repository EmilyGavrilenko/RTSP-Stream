'use client'
import Image from "next/image"
import { Suspense, useState, useEffect } from "react"
import CarsCrossed from "./components/CarsCrossed"
import LineValues from "./components/LineValues"
import RecentRows from "./components/RecentRows"
import RangeSelector from "./components/RangeSelector"

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);


  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 w-full flex justify-center">
        <div className="w-[800px] h-[400px] relative">
        <img
          src={`https://ijetbteoxyzikljccfrs.supabase.co/storage/v1/object/public/rtsp-stream/home_webcam.jpg?t=${timestamp}`}
          alt="Traffic Camera"
          width={800}
          height={400}
          className="rounded-lg shadow-lg"
        />
        </div>
      </div>

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
    </main>
  )
}

