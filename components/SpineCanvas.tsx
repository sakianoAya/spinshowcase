"use client"

import type React from "react"

import { useRef, forwardRef, useImperativeHandle, useEffect, useState, useCallback } from "react"

export interface SpineCanvasRef {
  getCanvas: () => HTMLCanvasElement | null
  resize: () => void
  resetView: () => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
}

interface SpineCanvasProps {
  isLoading: boolean
  loadingStage: string
  error: string | null
  selectedWork: {
    id: string
    name: string
    description: string
  }
}

export const SpineCanvas = forwardRef<SpineCanvasRef, SpineCanvasProps>(
  ({ isLoading, loadingStage, error, selectedWork }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // 視圖控制狀態
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // 最小和最大縮放限制
    const MIN_ZOOM = 0.1
    const MAX_ZOOM = 5

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      resize: () => {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          canvas.width = rect.width
          canvas.height = rect.height
        }
      },
      resetView: () => {
        setZoom(1)
        setPan({ x: 0, y: 0 })
      },
      setZoom: (newZoom: number) => {
        setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)))
      },
      setPan: (x: number, y: number) => {
        setPan({ x, y })
      },
    }))

    // 處理滾輪縮放
    const handleWheel = useCallback(
      (e: WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta))
        setZoom(newZoom)
      },
      [zoom],
    )

    // 處理鼠標拖拽
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button === 0) {
          setIsDragging(true)
          setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        }
      },
      [pan],
    )

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (isDragging) {
          setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          })
        }
      },
      [isDragging, dragStart],
    )

    const handleMouseUp = useCallback(() => {
      setIsDragging(false)
    }, [])

    // 設置事件監聽器
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.addEventListener("wheel", handleWheel, { passive: false })

      return () => {
        canvas.removeEventListener("wheel", handleWheel)
      }
    }, [handleWheel])

    // 自動調整畫布大小
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const resizeObserver = new ResizeObserver(() => {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      })

      resizeObserver.observe(canvas)

      return () => {
        resizeObserver.disconnect()
      }
    }, [])

    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-black relative">
        {/* Work Info Overlay */}
        <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3">
          <h2 className="text-white font-medium text-lg">{selectedWork.name}</h2>
          <p className="text-gray-300 text-sm">{selectedWork.description}</p>
        </div>

        {/* Canvas with transparent background */}
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-transparent"
          style={{
            imageRendering: "pixelated",
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium text-lg">{loadingStage}</p>
              <p className="text-gray-400 text-sm mt-1">Loading {selectedWork.name}...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center z-20">
            <div className="text-center bg-black/80 rounded-lg p-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠</span>
              </div>
              <p className="text-red-400 font-medium text-lg mb-2">Render Error</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* View Info */}
        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-300">Zoom: {(zoom * 100).toFixed(0)}%</span>
            <span className="text-gray-300">
              Pan: {pan.x.toFixed(0)}, {pan.y.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Controls Hint */}
        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-gray-300 text-sm">🖱️ Drag to pan • 🔄 Scroll to zoom</p>
        </div>
      </div>
    )
  },
)

SpineCanvas.displayName = "SpineCanvas"
