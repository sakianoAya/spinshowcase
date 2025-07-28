"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Upload, RotateCcw, Database, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ModelStorageManagerProps {
  onExport: () => string
  onImport: (config: string) => boolean
  onReset: () => Promise<boolean>
}

export function ModelStorageManager({ onExport, onImport, onReset }: ModelStorageManagerProps) {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importConfig, setImportConfig] = useState("")
  const [importError, setImportError] = useState("")
  const [isResetting, setIsResetting] = useState(false)

  const handleExport = () => {
    const config = onExport()

    // 創建下載鏈接
    const blob = new Blob([config], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `spine-models-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsExportOpen(false)
  }

  const handleImport = () => {
    setImportError("")

    if (!importConfig.trim()) {
      setImportError("請輸入配置內容")
      return
    }

    const success = onImport(importConfig)
    if (success) {
      setImportConfig("")
      setIsImportOpen(false)
    } else {
      setImportError("配置格式無效或導入失敗")
    }
  }

  const handleReset = async () => {
    if (!confirm("確定要重置到默認模型嗎？這將清除所有自定義模型。")) {
      return
    }

    setIsResetting(true)
    try {
      await onReset()
    } finally {
      setIsResetting(false)
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportConfig(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogTrigger asChild>
          <motion.button
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="導出模型配置"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              導出模型配置
            </DialogTitle>
            <DialogDescription className="text-gray-400">將當前所有模型配置導出為 JSON 文件</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm font-medium">導出內容</span>
              </div>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 所有自定義和默認模型</li>
                <li>• 模型配置和文件路徑</li>
                <li>• 導出時間戳</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsExportOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <motion.button
              onClick={handleExport}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              導出下載
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <motion.button
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="導入模型配置"
          >
            <Upload className="w-4 h-4 text-gray-300" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              導入模型配置
            </DialogTitle>
            <DialogDescription className="text-gray-400">從 JSON 文件導入模型配置</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">選擇文件</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
              />
            </div>

            {/* Manual Input */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">或手動輸入配置</label>
              <Textarea
                value={importConfig}
                onChange={(e) => setImportConfig(e.target.value)}
                placeholder="貼上 JSON 配置內容..."
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[200px] font-mono text-sm"
              />
            </div>

            {/* Error Display */}
            {importError && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">{importError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setIsImportOpen(false)
                setImportConfig("")
                setImportError("")
              }}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <motion.button
              onClick={handleImport}
              disabled={!importConfig.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              導入
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Button */}
      <motion.button
        onClick={handleReset}
        disabled={isResetting}
        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="重置到默認模型"
      >
        <RotateCcw className={`w-4 h-4 text-gray-300 ${isResetting ? "animate-spin" : ""}`} />
      </motion.button>
    </div>
  )
}
