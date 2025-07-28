"use client"

import { AlertTriangle, Loader2, CheckCircle, RotateCcw, Info } from "lucide-react"

interface StatusAlertsProps {
  error: string | null
  isLoading: boolean
  loadingStage: string
  onRetry: () => void
}

export function StatusAlerts({ error, isLoading, loadingStage, onRetry }: StatusAlertsProps) {
  // 錯誤狀態
  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-red-800/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium mb-1">System Error</h3>
            <p className="text-gray-400 text-sm mb-3 break-words">{error}</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 載入狀態
  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
          <div>
            <h3 className="text-white font-medium">Loading System</h3>
            <p className="text-gray-400 text-sm">{loadingStage}</p>
          </div>
        </div>
      </div>
    )
  }

  // 成功狀態 (只在用戶主動開啟時顯示)
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-gray-800">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">System Ready</h3>
          <p className="text-gray-400 text-sm mb-4">Spine2D animation engine loaded successfully</p>

          {/* 系統信息 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300 text-xs font-medium">WebGL</span>
              </div>
              <span className="text-emerald-400 font-mono text-sm">Supported</span>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300 text-xs font-medium">Renderer</span>
              </div>
              <span className="text-emerald-400 font-mono text-sm">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
