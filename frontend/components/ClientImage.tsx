'use client'
import { useState, useEffect } from "react"


export default function ClientImage() {
    const [timestamp, setTimestamp] = useState(Date.now());

    useEffect(() => {
      const interval = setInterval(() => {
        setTimestamp(Date.now());
      }, 1000); // Update every second
  
      return () => clearInterval(interval);
    }, []);

  return (
    <div className="mb-8 w-full flex justify-center">
        <div className="w-[800px] h-[400px] relative">
        <img
          src={`https://ijetbteoxyzikljccfrs.supabase.co/storage/v1/object/public/rtsp-stream/sf_hub_stream.jpg?t=${timestamp}`}
          alt="Traffic Camera"
          width={800}
          height={400}
          className="rounded-lg shadow-lg"
        />
        </div>
      </div>
  )
} 