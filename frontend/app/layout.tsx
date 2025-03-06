import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Traffic Monitor',
  description: 'Created with Roboflow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
