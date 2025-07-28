"use client"

import { useSpineLoader } from "@/hooks/useSpineLoader"
import { useRef } from "react"

declare global {
  interface Window {
    spine: any
  }
}

export default function SpineViewer() {
  const { isLoaded, error, spine } = useSpineLoader()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!isLoaded) {
    return <div>Loading Spine WebGL...</div>
  }

  // 現在可以安全使用 spine
  return (
    <div>
      <canvas ref={canvasRef} />
      {/* 其他組件 */}
    </div>
  )
}
