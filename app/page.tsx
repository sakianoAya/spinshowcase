"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SpineCanvas, type SpineCanvasRef } from "@/components/SpineCanvas"
import { WorksList } from "@/components/WorksList"
import { ControlPanel } from "@/components/ControlPanel"
import { useSpineEngine } from "@/hooks/useSpineEngine"
import { useModelStorage } from "@/hooks/useModelStorage"
import { Folder } from "lucide-react"

export default function SpineAnimatorPortfolio() {
  const canvasRef = useRef<SpineCanvasRef>(null)

  const {
    // 狀態
    loadingStage,
    isLoading,
    error,
    debugLogs,
    currentAnimation,
    availableAnimations,
    currentSkin,
    availableSkins,
    spineApiInfo,
    showDebug,

    // 設置函數
    setCurrentAnimation,
    setCurrentSkin,
    setAvailableSkins,
    setShowDebug,
    setIsLoading,
    setError,
    setLoadingStage,
    setAvailableAnimations,
    setDebugLogs,

    // 引用和工具
    spineRef,
    animationRef,
    addLog,
    checkWebGLSupport,
    loadSpineLibrary,
    validateAssets,
    cleanup,
  } = useSpineEngine()

  // 使用模型存儲 hook
  const {
    models: works,
    initializeModels,
    addModel,
    editModel,
    deleteModel,
    exportModels,
    importModels,
    resetToDefaults,
  } = useModelStorage()

  const [selectedWork, setSelectedWork] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isUiVisible, setIsUiVisible] = useState(true)

  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isUiVisible) {
        setIsUiVisible(true)
        addLog("UI 重新顯示")
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [isUiVisible, addLog])

  // 新增模型處理函數
  const handleAddModel = useCallback(
    async (newModel: any) => {
      try {
        addLog(`新增模型: ${newModel.name}`)

        // 檢查是否有文件需要上傳
        const hasFileUploads =
          newModel.atlasPath.startsWith("/assets/") ||
          newModel.jsonPath.startsWith("/assets/") ||
          newModel.imagePath.startsWith("/assets/")

        if (hasFileUploads) {
          addLog(`模型 ${newModel.name} 包含本地文件，需要後端處理上傳`)
        }

        // 使用 storage hook 添加模型
        const success = addModel(newModel)
        if (success) {
          addLog(`模型 ${newModel.name} 已成功添加並保存到本地存儲`)
        } else {
          throw new Error("保存到本地存儲失敗")
        }
      } catch (error) {
        addLog(`新增模型失敗: ${error}`)
        throw error
      }
    },
    [addLog, addModel],
  )

  // 編輯模型處理函數
  const handleEditModel = useCallback(
    async (updatedModel: any) => {
      try {
        addLog(`編輯模型: ${updatedModel.name}`)

        const success = editModel(updatedModel)
        if (success) {
          // 如果編輯的是當前選中的模型，更新選中狀態並重新初始化
          if (selectedWork && selectedWork.id === updatedModel.id) {
            setSelectedWork(updatedModel)
            initialize(updatedModel)
          }
          addLog(`模型 ${updatedModel.name} 已成功更新並保存`)
        } else {
          throw new Error("保存到本地存儲失敗")
        }
      } catch (error) {
        addLog(`編輯模型失敗: ${error}`)
        throw error
      }
    },
    [addLog, editModel, selectedWork],
  )

  // 刪除模型處理函數
  const handleDeleteModel = useCallback(
    async (workId: string) => {
      try {
        const workToDelete = works.find((work) => work.id === workId)
        if (!workToDelete) {
          throw new Error(`找不到 ID 為 ${workId} 的模型`)
        }

        addLog(`刪除模型: ${workToDelete.name}`)

        const success = deleteModel(workId)
        if (success) {
          // 如果刪除的是當前選中的模型，選擇另一個模型
          if (selectedWork && selectedWork.id === workId) {
            const remainingWorks = works.filter((work) => work.id !== workId)
            if (remainingWorks.length > 0) {
              const nextWork = remainingWorks[0]
              setSelectedWork(nextWork)
              initialize(nextWork)
            } else {
              setSelectedWork(null)
            }
          }
          addLog(`模型 ${workToDelete.name} 已成功刪除`)
        } else {
          throw new Error("從本地存儲刪除失敗")
        }
      } catch (error) {
        addLog(`刪除模型失敗: ${error}`)
        throw error
      }
    },
    [addLog, deleteModel, works, selectedWork],
  )

  // 導出模型配置
  const handleExportModels = useCallback(() => {
    addLog("導出模型配置")
    return exportModels()
  }, [addLog, exportModels])

  // 導入模型配置
  const handleImportModels = useCallback(
    (config: string) => {
      try {
        addLog("導入模型配置")
        const success = importModels(config)
        if (success) {
          addLog("模型配置導入成功")
          // 重新選擇第一個模型
          if (works.length > 0) {
            const firstWork = works[0]
            setSelectedWork(firstWork)
            initialize(firstWork)
          }
        }
        return success
      } catch (error) {
        addLog(`導入模型配置失敗: ${error}`)
        return false
      }
    },
    [addLog, importModels, works],
  )

  // 重置到默認模型
  const handleResetModels = useCallback(async () => {
    try {
      addLog("重置到默認模型")
      const success = await resetToDefaults()
      if (success) {
        addLog("已重置到默認模型")
        // 重新選擇第一個模型
        if (works.length > 0) {
          const firstWork = works[0]
          setSelectedWork(firstWork)
          initialize(firstWork)
        }
      }
      return success
    } catch (error) {
      addLog(`重置失敗: ${error}`)
      return false
    }
  }, [addLog, resetToDefaults, works])

  // 初始化 Spine 應用
  const initSpineApp = useCallback(
    async (work: any): Promise<void> => {
      const canvas = canvasRef.current?.getCanvas()
      if (!canvas) {
        throw new Error("Canvas 元素不存在")
      }

      if (!window.spine) {
        throw new Error("Spine 庫未載入")
      }

      addLog(`初始化 Spine 應用: ${work.name}`)
      setLoadingStage("初始化 Spine")

      try {
        // 清理之前的資源
        if (spineRef.current.renderer) {
          try {
            spineRef.current.renderer.dispose?.()
          } catch (e) {
            console.warn("Previous renderer cleanup failed:", e)
          }
        }

        // 設置 canvas 大小
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height

        // 創建 WebGL 上下文
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (!gl) {
          throw new Error("無法創建 WebGL 上下文")
        }

        addLog("WebGL 上下文創建成功")

        // 創建渲染器
        const renderer = new window.spine.SceneRenderer(canvas, gl)
        const assetManager = new window.spine.AssetManager(gl)

        // 創建調試渲染器
        let debugRenderer = null
        try {
          if (window.spine.SkeletonDebugRenderer) {
            debugRenderer = new window.spine.SkeletonDebugRenderer(gl)
            addLog("SkeletonDebugRenderer 創建成功")
          } else if (window.spine.ShapeRenderer) {
            debugRenderer = new window.spine.ShapeRenderer(gl)
            addLog("ShapeRenderer 創建成功（降級）")
          } else {
            addLog("調試渲染器不可用")
          }
        } catch (debugError) {
          addLog(`調試渲染器創建失敗: ${debugError}`)
        }

        // 創建 TimeKeeper
        let timeKeeper = null
        if (window.spine.TimeKeeper) {
          timeKeeper = new window.spine.TimeKeeper()
          addLog("TimeKeeper 創建成功")
        } else {
          addLog("TimeKeeper 不可用，使用手動時間管理")
        }

        spineRef.current.renderer = renderer
        spineRef.current.debugRenderer = debugRenderer
        spineRef.current.timeKeeper = timeKeeper

        if (renderer.skeletonDebugRenderer) {
          renderer.skeletonDebugRenderer.drawMeshHull = false
          renderer.skeletonDebugRenderer.drawMeshTriangles = false
          addLog("調試渲染器選項設置完成")
        }

        addLog("Spine 渲染器創建成功")

        // 載入資源
        await loadSpineAssets(renderer, assetManager, work)
      } catch (error) {
        throw new Error(`Spine 應用初始化失敗: ${error}`)
      }
    },
    [addLog, spineRef],
  )

  // 載入 Spine 資源
  const loadSpineAssets = useCallback(
    async (renderer: any, assetManager: any, work: any): Promise<void> => {
      addLog(`載入 Spine 資源: ${work.name}`)
      setLoadingStage("載入動畫資源")

      try {
        assetManager.loadTextureAtlas(work.atlasPath)
        assetManager.loadJson(work.jsonPath)

        let attempts = 0
        const maxAttempts = 100

        while (!assetManager.isLoadingComplete() && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (attempts >= maxAttempts) {
          throw new Error("資源載入超時")
        }

        addLog("AssetManager 載入完成")
        await createSkeleton(renderer, assetManager, work)
      } catch (error) {
        throw new Error(`資源載入失敗: ${error}`)
      }
    },
    [addLog],
  )

  // 創建骨骼
  const createSkeleton = useCallback(
    async (renderer: any, assetManager: any, work: any): Promise<void> => {
      addLog(`創建骨骼: ${work.name}`)
      setLoadingStage("創建骨骼")

      try {
        const atlas = assetManager.require(work.atlasPath)
        const jsonData = assetManager.require(work.jsonPath)

        addLog("資源獲取成功")

        const atlasLoader = new window.spine.AtlasAttachmentLoader(atlas)
        const skeletonJson = new window.spine.SkeletonJson(atlasLoader)

        const skeletonData = skeletonJson.readSkeletonData(jsonData)
        addLog(`骨骼數據讀取成功，包含 ${skeletonData.bones.length} 個骨骼`)

        const skeleton = new window.spine.Skeleton(skeletonData)
        const state = new window.spine.AnimationState(new window.spine.AnimationStateData(skeletonData))

        spineRef.current.skeleton = skeleton
        spineRef.current.state = state

        addLog("骨骼和動畫狀態創建成功")

        // 獲取動畫列表
        const animations = skeletonData.animations.map((anim: any) => anim.name)
        setAvailableAnimations(animations)
        addLog(`發現 ${animations.length} 個動畫: ${animations.join(", ")}`)

        // 獲取皮膚列表 - 修復皮膚處理邏輯
        let skins: string[] = []
        try {
          if (skeletonData.skins && skeletonData.skins.length > 0) {
            skins = skeletonData.skins.map((skin: any) => skin.name || "default")
            addLog(`發現 ${skins.length} 個皮膚: ${skins.join(", ")}`)
          } else {
            skins = ["default"]
            addLog("未發現自定義皮膚，使用默認皮膚")
          }
        } catch (skinError) {
          addLog(`皮膚檢測失敗: ${skinError}，使用默認皮膚`)
          skins = ["default"]
        }

        setAvailableSkins(skins)

        // 設置默認動畫
        if (animations.length > 0) {
          const firstAnimation = animations[0]
          setCurrentAnimation(firstAnimation)
          state.setAnimation(0, firstAnimation, true)
          addLog(`設置默認動畫: ${firstAnimation}`)
        }

        // 設置默認皮膚 - 改進皮膚設置邏輯
        if (skins.length > 0) {
          const firstSkin = skins[0]
          setCurrentSkin(firstSkin)

          try {
            // 嘗試設置皮膚
            if (firstSkin !== "default" && skeletonData.findSkin) {
              const skinData = skeletonData.findSkin(firstSkin)
              if (skinData) {
                skeleton.setSkin(skinData)
                addLog(`設置皮膚成功: ${firstSkin}`)
              } else {
                addLog(`皮膚 ${firstSkin} 不存在，使用默認設置`)
              }
            } else {
              // 使用默認皮膚或跳過皮膚設置
              addLog(`使用默認皮膚設置`)
            }
          } catch (skinSetError) {
            addLog(`皮膚設置失敗: ${skinSetError}，繼續使用默認設置`)
          }
        }

        skeleton.setToSetupPose()

        try {
          if (window.spine.Physics && window.spine.Physics.update) {
            skeleton.updateWorldTransform(window.spine.Physics.update)
            addLog("使用物理系統更新世界變換")
          } else {
            skeleton.updateWorldTransform()
            addLog("使用標準方式更新世界變換")
          }
        } catch (physicsError) {
          addLog(`物理更新失敗，使用標準更新: ${physicsError}`)
          skeleton.updateWorldTransform()
        }

        let offset, bounds
        if (window.spine.Vector2) {
          offset = new window.spine.Vector2()
          bounds = new window.spine.Vector2()
          skeleton.getBounds(offset, bounds, [])
        } else {
          offset = { x: 0, y: 0 }
          bounds = { x: 400, y: 400 }
          addLog("使用默認邊界值")
        }

        spineRef.current.bounds = { offset, bounds }

        addLog(
          `邊界計算完成: offset(${offset.x.toFixed(1)}, ${offset.y.toFixed(1)}), size(${bounds.x.toFixed(1)}, ${bounds.y.toFixed(1)})`,
        )

        if (renderer.camera) {
          renderer.camera.position.x = offset.x + bounds.x / 2
          renderer.camera.position.y = offset.y + bounds.y / 2
          addLog("相機位置設置成功")
        } else {
          addLog("相機不可用，將在渲染時手動設置")
        }

        // 重置視圖狀態到默認值
        if (canvasRef.current) {
          canvasRef.current.resetView()
          addLog("重置視圖狀態: zoom=1, pan=(0, 0)")
        }

        setIsLoading(false)
        setLoadingStage("完成")

        // 確保渲染循環只啟動一次
        if (!isInitialized) {
          startRenderLoop()
          setIsInitialized(true)
        }
      } catch (error) {
        throw new Error(`骨骼創建失敗: ${error}`)
      }
    },
    [
      addLog,
      setAvailableAnimations,
      setCurrentAnimation,
      setAvailableSkins,
      setCurrentSkin,
      setIsLoading,
      setLoadingStage,
      isInitialized,
    ],
  )

  // 渲染循環 - 動畫始終播放
  const startRenderLoop = useCallback(() => {
    addLog("開始渲染循環")

    const render = () => {
      try {
        const canvas = canvasRef.current?.getCanvas()
        const { renderer, debugRenderer, skeleton, state, bounds, timeKeeper } = spineRef.current

        if (!canvas || !renderer || !skeleton || !state) {
          animationRef.current = requestAnimationFrame(render)
          return
        }

        let delta = 0.016
        if (timeKeeper) {
          timeKeeper.update()
          delta = timeKeeper.delta
        } else {
          const now = Date.now() / 1000
          delta = now - spineRef.current.lastFrameTime
          spineRef.current.lastFrameTime = now
        }

        // 動畫始終播放
        state.update(delta)
        state.apply(skeleton)

        try {
          if (window.spine.Physics && window.spine.Physics.update) {
            skeleton.updateWorldTransform(window.spine.Physics.update)
          } else {
            skeleton.updateWorldTransform()
          }
        } catch (e) {
          skeleton.updateWorldTransform()
        }

        if (bounds && renderer.camera) {
          renderer.camera.viewportWidth = bounds.bounds.x * 1.4
          renderer.camera.viewportHeight = bounds.bounds.y * 1.4
        }

        if (renderer.resize) {
          renderer.resize(window.spine?.ResizeMode?.Fit || 0)
        }

        const gl = renderer.gl || renderer.context?.gl
        if (gl) {
          // 設置透明背景
          gl.clearColor(0, 0, 0, 0) // RGBA: 完全透明
          gl.clear(gl.COLOR_BUFFER_BIT)

          // 啟用混合模式以支持透明度
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        }

        renderer.begin()
        renderer.drawSkeleton(skeleton, true)
        renderer.end()

        if (showDebug && debugRenderer) {
          try {
            if (debugRenderer.drawSkeleton) {
              debugRenderer.drawSkeleton(skeleton)
            } else if (renderer.skeletonDebugRenderer && renderer.skeletonDebugRenderer.draw) {
              renderer.skeletonDebugRenderer.draw(skeleton)
            } else if (debugRenderer.line) {
              skeleton.bones.forEach((bone: any) => {
                if (bone.parent) {
                  debugRenderer.line(bone.parent.worldX, bone.parent.worldY, bone.worldX, bone.worldY, 0x00ff00)
                }
              })
            }
          } catch (debugError) {
            console.warn("調試渲染失敗:", debugError)
          }
        }
      } catch (error) {
        addLog(`渲染錯誤: ${error}`)
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()
  }, [addLog, showDebug, spineRef, animationRef])

  // 主初始化函數
  const initialize = useCallback(
    async (work: any) => {
      if (!work) {
        setError("No work selected")
        return
      }

      try {
        setError(null)
        setDebugLogs([])
        setIsLoading(true)

        addLog(`開始初始化: ${work.name}`)

        if (!checkWebGLSupport()) {
          throw new Error("瀏覽器不支持 WebGL")
        }
        addLog("WebGL 支持檢查通過")

        await loadSpineLibrary()
        await validateAssets(work)
        await initSpineApp(work)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addLog(`初始化失敗: ${errorMessage}`)
        setError(errorMessage)
        setIsLoading(false)
      }
    },
    [addLog, checkWebGLSupport, loadSpineLibrary, validateAssets, initSpineApp, setError, setDebugLogs, setIsLoading],
  )

  const changeAnimation = (animationName: string) => {
    const { state } = spineRef.current
    if (state && animationName) {
      state.setAnimation(0, animationName, true)
      setCurrentAnimation(animationName)
      addLog(`切換動畫: ${animationName}`)
    }
  }

  const changeSkin = (skinName: string) => {
    const { skeleton } = spineRef.current
    if (skeleton && skinName) {
      try {
        // 改進皮膚切換邏輯
        if (skinName === "default") {
          // 重置到默認皮膚
          skeleton.setToSetupPose()
          addLog(`重置到默認皮膚`)
        } else {
          // 嘗試使用 skeletonData 來查找皮膚
          const skeletonData = skeleton.data
          if (skeletonData && skeletonData.findSkin) {
            const skinData = skeletonData.findSkin(skinName)
            if (skinData) {
              skeleton.setSkin(skinData)
              skeleton.setSlotsToSetupPose()
              addLog(`切換皮膚成功: ${skinName}`)
            } else {
              addLog(`皮膚 ${skinName} 不存在`)
              return
            }
          } else {
            // 降級處理：嘗試直接設置皮膚名稱
            skeleton.setSkin(skinName)
            skeleton.setSlotsToSetupPose()
            addLog(`切換皮膚 (降級模式): ${skinName}`)
          }
        }

        setCurrentSkin(skinName)
      } catch (error) {
        addLog(`皮膚切換失敗: ${error}`)
        // 如果切換失敗，保持當前皮膚狀態不變
      }
    }
  }

  // 切換作品
  const handleWorkChange = useCallback(
    (work: any) => {
      if (selectedWork && work.id === selectedWork.id) {
        addLog(`模型 ${work.name} 已經是當前選中的模型`)
        return
      }

      addLog(`切換作品: ${selectedWork?.name || "None"} -> ${work.name}`)

      // 停止當前的渲染循環
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // 立即更新選中的作品
      setSelectedWork(work)

      // 重置動畫和皮膚狀態
      setAvailableAnimations([])
      setCurrentAnimation("")
      setAvailableSkins([])
      setCurrentSkin("")

      // 開始初始化新模型
      initialize(work)
    },
    [selectedWork, addLog, animationRef, initialize],
  )

  // Hide UI 處理函數
  const handleToggleUiVisibility = () => {
    setIsUiVisible(!isUiVisible)
    if (isUiVisible) {
      addLog("UI 已隱藏，按 Enter 鍵重新顯示")
    } else {
      addLog("UI 重新顯示")
    }
  }

  // 初始化載入模型配置
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await initializeModels()
        if (models.length > 0) {
          const firstModel = models[0]
          setSelectedWork(firstModel)
          // 延遲初始化以確保組件完全掛載
          setTimeout(() => initialize(firstModel), 100)
        }
      } catch (error) {
        addLog(`Failed to load models: ${error}`)
      }
    }

    loadModels()
  }, [initializeModels, addLog, initialize])

  // 監聽動畫變化
  useEffect(() => {
    if (currentAnimation && spineRef.current.state) {
      changeAnimation(currentAnimation)
    }
  }, [currentAnimation])

  // 監聽皮膚變化
  useEffect(() => {
    if (currentSkin && spineRef.current.skeleton) {
      changeSkin(currentSkin)
    }
  }, [currentSkin])

  // 清理函數
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <div className="h-screen text-white overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Top Navigation */}
      <nav className="h-16 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6 relative z-20">
        {/* Left - Personal Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-light tracking-wider">
            <span className="text-white">CHUNG CHENG-HAN</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-emerald-400">SpineShowcase</span>
          </h1>
        </div>

        {/* Right - Navigation Links */}
        <div className="flex items-center gap-8">
          <a
            href="https://han-portfoliogamestyle.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors font-light tracking-wide"
          >
            ABOUT ME
          </a>

          <div className="relative group">
            <button className="text-gray-300 hover:text-white transition-colors font-light tracking-wide">
              CONTACT ME
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Email</p>
                  <a
                    href="mailto:aya871210@gmail.com"
                    className="text-white hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    aya871210@gmail.com
                  </a>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">GitHub</p>
                  <a
                    href="https://github.com/sakianoAya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 1.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    sakianoAya
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* UI Hidden Notification */}
      <AnimatePresence>
        {!isUiVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-16 left-0 right-0 z-30 bg-gradient-to-r from-emerald-500/90 to-blue-500/90 backdrop-blur-sm border-b border-emerald-400/30"
          >
            <div className="flex items-center justify-center py-3 px-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-medium">UI Hidden</span>
                <span className="text-white/80">•</span>
                <span className="text-white/90">Press</span>
                <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono text-sm">Enter</kbd>
                <span className="text-white/90">to show UI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="h-[calc(100vh-4rem)] flex relative">
        {/* Left Sidebar - Works List */}
        <motion.div
          className="bg-[#1a1a1a] border-r border-gray-800 relative z-10 flex-shrink-0"
          animate={{ width: isUiVisible ? 320 : 0, opacity: isUiVisible ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ height: "100%" }}
        >
          <div className="w-80 h-full">
            <WorksList
              works={works}
              selectedWork={selectedWork}
              onWorkChange={handleWorkChange}
              onAddModel={handleAddModel}
              onEditModel={handleEditModel}
              onDeleteModel={handleDeleteModel}
              onExportModels={handleExportModels}
              onImportModels={handleImportModels}
              onResetModels={handleResetModels}
              isLoading={isLoading}
            />
          </div>
        </motion.div>

        {/* Center - WebGL Canvas */}
        <div className="flex-1 relative">
          {selectedWork ? (
            <SpineCanvas
              ref={canvasRef}
              isLoading={isLoading}
              loadingStage={loadingStage}
              error={error}
              selectedWork={selectedWork}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">No model selected</p>
                <p className="text-gray-500 text-sm mt-1">Choose a model from the left panel</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Tools Panel */}
        <motion.div
          className="bg-[#1a1a1a] border-l border-gray-800 relative z-10 flex-shrink-0"
          animate={{ width: isUiVisible ? 320 : 0, opacity: isUiVisible ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ height: "100%" }}
        >
          <div className="w-80 h-full">
            <ControlPanel
              canvasRef={canvasRef}
              isLoading={isLoading}
              error={error}
              currentAnimation={currentAnimation}
              availableAnimations={availableAnimations}
              currentSkin={currentSkin}
              availableSkins={availableSkins}
              onAnimationChange={setCurrentAnimation}
              onSkinChange={setCurrentSkin}
              onToggleUiVisibility={handleToggleUiVisibility}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
