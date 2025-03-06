import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">How We Built This</h1>
        
        <div className="space-y-8">
          <section className="prose lg:prose-xl">
            <h2 className="text-2xl font-semibold mb-4">The Setup</h2>
            <p>
              This traffic monitoring system runs on a Raspberry Pi, using computer vision to detect and count vehicles
              in real-time. We use Roboflow for our computer vision pipeline, which allows us to accurately detect and
              track vehicles as they cross predefined lines on the street.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src="/images/build1.png"
                  alt="Project setup image 1"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src="/images/build2.jpeg"
                  alt="Project setup image 2"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">The Technology</h2>
            <p>
              Our system leverages several key technologies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Raspberry Pi for edge computing and video capture</li>
              <li>Roboflow for computer vision and object detection</li>
              <li>Next.js for the web interface</li>
              <li>Real-time data processing and visualization</li>
            </ul>

            <div className="mt-8 space-y-4">
              <p>Learn more about the technologies we used:</p>
              <div className="space-x-4">
                <Link 
                  href="https://app.roboflow.com/workflows/embed/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3JrZmxvd0lkIjoiT0pRdEdrQ3N4SUVoZXgxOGYzcm4iLCJ3b3Jrc3BhY2VJZCI6IkltRkxJWlNrR2JOeTl6YjRVdXFsTXpQUnBwUTIiLCJ1c2VySWQiOiJJbUZMSVpTa0diTnk5emI0VXVxbE16UFJwcFEyIiwiaWF0IjoxNzQxMzAyNDQ0fQ.rZ3Ntd9cqCHlvwYHY2-eh80tw1ir2YhTYQT-Cb19sfc" 
                  target="_blank"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Roboflow Workflow
                </Link>
                <Link 
                  href="https://inference.roboflow.com" 
                  target="_blank"
                  className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Roboflow Inference
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            ← Back to Traffic Monitor
          </Link>
        </div>
      </div>
    </main>
  )
} 