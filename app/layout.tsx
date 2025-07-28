import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SpineShowcase - Professional Spine2D Animation Platform",
  description:
    "Interactive Spine2D animation showcase platform with real-time WebGL rendering, model management, and animation controls.",
  keywords: ["Spine2D", "Animation", "WebGL", "Showcase", "Interactive", "Portfolio"],
  authors: [{ name: "CHUNG CHENG-HAN" }],
  creator: "CHUNG CHENG-HAN",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
