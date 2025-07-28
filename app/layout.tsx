import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "SpineShowcase - Professional Spine2D Animation Platform",
  description:
    "Interactive Spine2D animation showcase platform with real-time WebGL rendering, model management, and animation controls.",
  keywords: ["Spine2D", "Animation", "WebGL", "Showcase", "Interactive", "Portfolio"],
  authors: [{ name: "CHUNG CHENG-HAN" }],
  creator: "CHUNG CHENG-HAN",
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  openGraph: {
    title: "SpineShowcase - Professional Spine2D Animation Platform",
    description: "Interactive Spine2D animation showcase platform with real-time WebGL rendering",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpineShowcase - Professional Spine2D Animation Platform",
    description: "Interactive Spine2D animation showcase platform with real-time WebGL rendering",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://blob.v0.dev" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
