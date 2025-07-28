"use client"

import { useRef, useState, useCallback } from "react"

// 聲明全局 spine 對象
declare global {
  interface Window {
    spine: any
  }
}

export function useSpineEngine() {
  // 狀態管理
  const [loadingStage, setLoadingStage] = useState("初始化")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState([1])
  const [currentAnimation, setCurrentAnimation] = useState<string>("")
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([])
  const [currentSkin, setCurrentSkin] = useState<string>("")
  const [availableSkins, setAvailableSkins] = useState<string[]>([])
  const [spineApiInfo, setSpineApiInfo] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)

  const animationRef = useRef<number>()

  // Spine 相關狀態
  const spineRef = useRef<{
    renderer: any
    debugRenderer: any
    skeleton: any
    state: any
    bounds: any
    lastFrameTime: number
    timeKeeper: any
  }>({
    renderer: null,
    debugRenderer: null,
    skeleton: null,
    state: null,
    bounds: null,
    lastFrameTime: Date.now() / 1000,
    timeKeeper: null,
  })

  // 添加調試日誌
  const addLog = useCallback((message: string) => {
    console.log(`[Spine Debug] ${message}`)
    setDebugLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // 檢查 WebGL 支持
  const checkWebGLSupport = useCallback((): boolean => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      return !!gl
    } catch (e) {
      return false
    }
  }, [])

  // 檢查 Spine API
  const checkSpineAPI = useCallback(() => {
    if (!window.spine) return

    const apiInfo: string[] = []
    const spine = window.spine

    const mainClasses = [
      "SceneRenderer",
      "AssetManager",
      "AtlasAttachmentLoader",
      "SkeletonJson",
      "Skeleton",
      "AnimationState",
      "AnimationStateData",
      "TimeKeeper",
      "Vector2",
      "Vector3",
      "Physics",
      "SkeletonDebugRenderer",
      "ShapeRenderer",
    ]

    mainClasses.forEach((className) => {
      if (spine[className]) {
        apiInfo.push(`✓ ${className}`)
      } else {
        apiInfo.push(`✗ ${className}`)
      }
    })

    setSpineApiInfo(apiInfo)
    addLog(`API 檢查完成，發現 ${apiInfo.filter((info) => info.startsWith("✓")).length} 個可用類`)
  }, [addLog])

  // 載入 Spine WebGL 庫
  const loadSpineLibrary = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.spine) {
        addLog("Spine 庫已存在")
        checkSpineAPI()
        resolve()
        return
      }

      addLog("開始載入 Spine WebGL 庫...")
      setLoadingStage("載入 Spine 庫")

      const script = document.createElement("script")
      script.src = "https://unpkg.com/@esotericsoftware/spine-webgl@4.2.27/dist/iife/spine-webgl.js"

      script.onload = () => {
        addLog("Spine 庫載入成功")
        if (window.spine) {
          checkSpineAPI()
          addLog("Spine API 驗證成功")
          resolve()
        } else {
          reject(new Error("Spine 庫載入後無法訪問"))
        }
      }

      script.onerror = () => {
        reject(new Error("Spine 庫載入失敗"))
      }

      document.head.appendChild(script)
    })
  }, [addLog, checkSpineAPI])

  // 驗證資源文件
  const validateAssets = useCallback(
    async (selectedWork: any): Promise<void> => {
      addLog("驗證資源文件...")
      setLoadingStage("驗證資源")

      try {
        // Check if URLs are remote or local
        const isRemoteAtlas = selectedWork.atlasPath.startsWith("http")
        const isRemoteJson = selectedWork.jsonPath.startsWith("http")
        const isRemoteImage = selectedWork.imagePath.startsWith("http")

        // Validate Atlas file
        const atlasResponse = await fetch(selectedWork.atlasPath)
        if (!atlasResponse.ok) {
          throw new Error(`Atlas 文件載入失敗: ${atlasResponse.status}`)
        }
        const atlasText = await atlasResponse.text()
        addLog(`Atlas 文件載入成功 (${atlasText.length} 字符) - ${isRemoteAtlas ? "Remote" : "Local"}`)

        // Validate JSON file
        const jsonResponse = await fetch(selectedWork.jsonPath)
        if (!jsonResponse.ok) {
          throw new Error(`JSON 文件載入失敗: ${jsonResponse.status}`)
        }
        const jsonData = await jsonResponse.json()
        addLog(`JSON 文件載入成功 - ${isRemoteJson ? "Remote" : "Local"}`)
        addLog(
          `JSON 包含: bones(${jsonData.bones?.length || 0}), slots(${jsonData.slots?.length || 0}), animations(${Object.keys(jsonData.animations || {}).length})`,
        )

        // Validate PNG file
        const imgResponse = await fetch(selectedWork.imagePath)
        if (!imgResponse.ok) {
          throw new Error(`PNG 文件載入���敗: ${imgResponse.status}`)
        }
        addLog(`PNG 文件載入成功 - ${isRemoteImage ? "Remote" : "Local"}`)
      } catch (error) {
        throw new Error(`資源驗證失敗: ${error}`)
      }
    },
    [addLog],
  )

  // 載入模型配置
  const loadModelsConfig = useCallback(async (): Promise<any[]> => {
    try {
      const response = await fetch("/spine-models.json")
      if (!response.ok) {
        throw new Error(`Failed to load models config: ${response.status}`)
      }
      const config = await response.json()
      addLog(`Loaded ${config.models.length} model configurations`)
      return config.models
    } catch (error) {
      addLog(`Failed to load models config: ${error}`)
      // Return default models as fallback
      return [
        {
          id: "pinkbunny",
          name: "Pink Bunny",
          thumbnail: "/assets/pinkbunny.png",
          description: "Cute animated bunny character",
          atlasPath: "/assets/pinkbunny.atlas",
          jsonPath: "/assets/pinkbunny.json",
          imagePath: "/assets/pinkbunny.png",
        },
      ]
    }
  }, [addLog])

  // 初始化 Spine 應用
  const initSpineApp = useCallback(async () => {
    // Placeholder for initSpineApp logic
    addLog("Spine 應用初始化完成")
  }, [addLog])

  // 在文件末尾添加清理函數
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    // 清理 Spine 資源
    if (spineRef.current.renderer) {
      try {
        spineRef.current.renderer.dispose?.()
      } catch (e) {
        console.warn("Renderer cleanup failed:", e)
      }
    }
  }, [])

  // Update the main initialize function to pass selectedWork
  const initialize = useCallback(
    async (selectedWork: any) => {
      try {
        setError(null)
        setDebugLogs([])
        setIsLoading(true)

        if (!selectedWork) {
          throw new Error("No model selected")
        }

        addLog(`開始初始化模型: ${selectedWork.name}`)

        if (!checkWebGLSupport()) {
          throw new Error("瀏覽器不支持 WebGL")
        }
        addLog("WebGL 支持檢查通過")

        await loadSpineLibrary()
        await validateAssets(selectedWork)
        // Note: initSpineApp will be called from the main component
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addLog(`初始化失敗: ${errorMessage}`)
        setError(errorMessage)
        setIsLoading(false)
      }
    },
    [addLog, checkWebGLSupport, loadSpineLibrary, validateAssets],
  )

  return {
    // 狀態
    loadingStage,
    isLoading,
    error,
    debugLogs,
    isPlaying,
    animationSpeed,
    currentAnimation,
    availableAnimations,
    currentSkin,
    availableSkins,
    spineApiInfo,
    showDebug,

    // 設置函數
    setIsPlaying,
    setAnimationSpeed,
    setCurrentAnimation,
    setCurrentSkin,
    setAvailableSkins,
    setShowDebug,
    setIsLoading,
    setError,
    setLoadingStage,
    setDebugLogs,
    setAvailableAnimations,

    // 引用
    spineRef,
    animationRef,

    // 工具函數
    addLog,
    checkWebGLSupport,
    loadSpineLibrary,
    validateAssets,
    cleanup,
    loadModelsConfig,
    initialize,
  }
}
