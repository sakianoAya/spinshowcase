"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Settings, RotateCcw, EyeOff, Film, Palette } from "lucide-react"
import type { SpineCanvasRef } from "./SpineCanvas"

interface ControlPanelProps {
  canvasRef: React.RefObject<SpineCanvasRef>
  isLoading: boolean
  error: string | null
  currentAnimation: string
  availableAnimations: string[]
  currentSkin: string
  availableSkins: string[]
  onAnimationChange: (animation: string) => void
  onSkinChange: (skin: string) => void
  onToggleUiVisibility: () => void
}

export function ControlPanel({
  canvasRef,
  isLoading,
  error,
  currentAnimation,
  availableAnimations,
  currentSkin,
  availableSkins,
  onAnimationChange,
  onSkinChange,
  onToggleUiVisibility,
}: ControlPanelProps) {
  const isDisabled = isLoading || !!error

  const handleResetView = () => {
    canvasRef.current?.resetView()
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-white font-medium text-lg">Tools</h2>
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 overflow-y-auto p-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animation Selection */}
        {availableAnimations.length > 0 && (
          <motion.div variants={itemVariants}>
            <label className="block text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
              <Film className="w-4 h-4" /> Animation
            </label>
            <select
              value={currentAnimation}
              onChange={(e) => onAnimationChange(e.target.value)}
              disabled={isDisabled}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {availableAnimations.map((anim) => (
                <option key={anim} value={anim} className="bg-gray-800">
                  {anim}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Skin Selection */}
        {availableSkins.length > 1 && (
          <motion.div variants={itemVariants}>
            <label className="block text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Skin
            </label>
            <select
              value={currentSkin}
              onChange={(e) => onSkinChange(e.target.value)}
              disabled={isDisabled}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {availableSkins.map((skin) => (
                <option key={skin} value={skin} className="bg-gray-800">
                  {skin || "Default"}
                </option>
              ))}
            </select>
            <div className="mt-2 text-xs text-gray-400">
              {availableSkins.length} skin{availableSkins.length !== 1 ? "s" : ""} available
            </div>
          </motion.div>
        )}

        {/* Reset View */}
        <motion.div variants={itemVariants}>
          <label className="block text-gray-300 text-sm font-medium mb-3">View Control</label>
          <button
            onClick={handleResetView}
            disabled={isDisabled}
            className="w-full h-12 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 text-gray-200" />
            <span className="text-gray-200">Reset View</span>
          </button>
        </motion.div>

        {/* Hide UI */}
        <motion.div variants={itemVariants}>
          <label className="block text-gray-300 text-sm font-medium mb-3">Interface</label>
          <button
            onClick={onToggleUiVisibility}
            className="w-full h-12 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <EyeOff className="w-4 h-4 text-gray-200" />
            <span className="text-gray-200">Hide UI</span>
          </button>
        </motion.div>

        {/* Info Section */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h3 className="text-gray-300 text-sm font-medium mb-2">Controls</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center text-[10px]">🖱️</span>
                <span>Drag to pan the view</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center text-[10px]">🔄</span>
                <span>Scroll to zoom in/out</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">Enter</kbd>
                <span>Show UI when hidden</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Status */}
        <motion.div variants={itemVariants}>
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-gray-300 text-sm font-medium mb-3">Current Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Animation:</span>
                <span className="text-emerald-400 font-mono">{currentAnimation || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Skin:</span>
                <span className="text-purple-400 font-mono">{currentSkin || "Default"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Animations:</span>
                <span className="text-blue-400 font-mono">{availableAnimations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Skins:</span>
                <span className="text-orange-400 font-mono">{availableSkins.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
