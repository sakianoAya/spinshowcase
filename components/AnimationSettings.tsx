"use client"

import { Settings, Zap } from "lucide-react"

interface AnimationSettingsProps {
  animationSpeed: number[]
  showDebug: boolean
  isLoading: boolean
  error: string | null
  onSpeedChange: (speed: number[]) => void
  onDebugToggle: (show: boolean) => void
}

export function AnimationSettings({
  animationSpeed,
  showDebug,
  isLoading,
  error,
  onSpeedChange,
  onDebugToggle,
}: AnimationSettingsProps) {
  const isDisabled = isLoading || !!error

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-medium text-lg">Animation Settings</h3>
          <p className="text-gray-400 text-sm">Performance and debug options</p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        {/* Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-300 text-sm font-medium">Playback Speed</label>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-sm">{animationSpeed[0].toFixed(1)}x</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed[0]}
              onChange={(e) => onSpeedChange([Number.parseFloat(e.target.value)])}
              disabled={isDisabled}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1x</span>
              <span>1.0x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>

        {/* Debug Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-gray-300 text-sm font-medium">Debug Skeleton</label>
            <p className="text-gray-500 text-xs">Show bone wireframes</p>
          </div>

          <button
            onClick={() => onDebugToggle(!showDebug)}
            disabled={isDisabled}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
              showDebug ? "bg-emerald-500" : "bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                showDebug ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
  )
}
