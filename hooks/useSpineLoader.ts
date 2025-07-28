"use client"

import { useEffect, useState } from "react"

export function useSpineLoader() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 檢查是否已經加載
    if (window.spine) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    // 使用 IIFE 版本，不是 ESM 版本
    script.src = "https://unpkg.com/@esotericsoftware/spine-webgl@4.2.27/dist/iife/spine-webgl.js"

    script.onload = () => {
      if (window.spine) {
        setIsLoaded(true)
      } else {
        setError("Spine library loaded but not accessible")
      }
    }

    script.onerror = () => {
      setError("Failed to load Spine library")
    }

    document.head.appendChild(script)

    return () => {
      // 清理腳本標籤（可選）
      document.head.removeChild(script)
    }
  }, [])

  return { isLoaded, error, spine: window.spine }
}
