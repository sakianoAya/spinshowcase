"use client"

import { useState } from "react"

interface FileUploadResult {
  success: boolean
  path: string
  error?: string
}

export function useFileUploadService() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadFile = async (file: File, folderName: string): Promise<FileUploadResult> => {
    if (!file) {
      return { success: false, path: "", error: "No file provided" }
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 在實際應用中，這裡應該使用 fetch 或 axios 調用後端 API 來上傳文件
      // 由於瀏覽器環境限制，我們只能模擬文件上傳過程

      // 模擬上傳進度
      await simulateProgress()

      // 生成文件路徑
      const safeFolderName = folderName.toLowerCase().replace(/[^a-z0-9]/g, "-")
      const path = `/assets/${safeFolderName}/${file.name}`

      console.log(`[FileUpload] File would be uploaded to: ${path}`)

      setIsUploading(false)
      setUploadProgress(100)

      return {
        success: true,
        path,
      }
    } catch (error) {
      setIsUploading(false)
      return {
        success: false,
        path: "",
        error: error instanceof Error ? error.message : "Unknown error during upload",
      }
    }
  }

  // 模擬上傳進度
  const simulateProgress = async () => {
    return new Promise<void>((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploadProgress(100)
          setTimeout(resolve, 300) // 完成後稍微延遲
        } else {
          setUploadProgress(Math.floor(progress))
        }
      }, 300)
    })
  }

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  }
}
