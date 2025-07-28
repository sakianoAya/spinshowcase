"use client"

import { Play, Pause, RotateCcw, Film } from "lucide-react"

interface PlaybackControlsProps {
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  currentAnimation: string
  availableAnimations: string[]
  onTogglePlayPause: () => void
  onReset: () => void
  onAnimationChange: (animation: string) => void
}

export function PlaybackControls({
  isPlaying,
  isLoading,
  error,
  currentAnimation,
  availableAnimations,
  onTogglePlayPause,
  onReset,
  onAnimationChange,
}: PlaybackControlsProps) {
  const isDisabled = isLoading || !!error

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
          <Film className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-medium text-lg">Playback Controls</h3>
          <p className="text-gray-400 text-sm">Animation playback management</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Pause and Reset */}
        <div className="flex gap-3">
          <button
            onClick={onTogglePlayPause}
            disabled={isDisabled}
            className={`flex-1 h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isPlaying
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>

          <button
            onClick={onReset}
            disabled={isDisabled}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 text-gray-200" />
          </button>
        </div>

        {/* Animation Selector */}
        {availableAnimations.length > 0 && (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Animation Sequence</label>
            <select
              value={currentAnimation}
              onChange={(e) => onAnimationChange(e.target.value)}
              disabled={isDisabled}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availableAnimations.map((anim) => (
                <option key={anim} value={anim} className="bg-gray-800">
                  {anim}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
