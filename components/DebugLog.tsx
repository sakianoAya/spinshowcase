"use client"

import { Terminal, Activity, Cpu, Eye } from "lucide-react"

interface DebugLogProps {
  debugLogs: string[]
  loadingStage: string
  availableAnimations: string[]
  hasDebugRenderer: boolean
  webglSupported: boolean
  spineApiInfo: string[]
}

export function DebugLog({
  debugLogs,
  loadingStage,
  availableAnimations,
  hasDebugRenderer,
  webglSupported,
  spineApiInfo,
}: DebugLogProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-medium text-lg">Debug Console</h3>
          <p className="text-gray-400 text-sm">System logs and performance metrics</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300 text-sm font-medium">Animations</span>
          </div>
          <span className="text-white font-mono text-lg">{availableAnimations.length}</span>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm font-medium">WebGL</span>
          </div>
          <span className={`font-mono text-sm ${webglSupported ? "text-emerald-400" : "text-red-400"}`}>
            {webglSupported ? "Supported" : "Not Available"}
          </span>
        </div>
      </div>

      {/* API Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300 text-sm font-medium">Spine API Status</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1 text-xs font-mono">
            {spineApiInfo.length === 0 ? (
              <div className="text-gray-500 col-span-2">Checking API...</div>
            ) : (
              spineApiInfo.map((info, index) => (
                <div key={index} className={info.startsWith("✓") ? "text-emerald-400" : "text-red-400"}>
                  {info}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Debug Logs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-300 text-sm font-medium">Recent Logs</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
          {debugLogs.length === 0 ? (
            <div className="text-gray-500 text-xs font-mono">Waiting for logs...</div>
          ) : (
            <div className="space-y-1">
              {debugLogs.map((log, index) => (
                <div key={index} className="text-gray-300 text-xs font-mono leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
