import { NextResponse } from "next/server"

export async function GET() {
  const imageApiUrl = process.env.IMAGE_API_URL

  if (!imageApiUrl) {
    return NextResponse.json({ error: "Image API URL not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(imageApiUrl)
    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}

