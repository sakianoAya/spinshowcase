"use client"

import { useState, useCallback } from "react"

interface Work {
  id: string
  name: string
  thumbnail: string
  description: string
  atlasPath: string
  jsonPath: string
  imagePath: string
}

export function useModelStorage() {
  const [models, setModels] = useState<Work[]>([])

  // 從 localStorage 載入模型
  const loadModelsFromStorage = useCallback((): Work[] => {
    try {
      const stored = localStorage.getItem("spine-models")
      if (stored) {
        const parsedModels = JSON.parse(stored)
        console.log("[ModelStorage] Loaded models from localStorage:", parsedModels.length)
        return parsedModels
      }
    } catch (error) {
      console.error("[ModelStorage] Failed to load from localStorage:", error)
    }
    return []
  }, [])

  // 保存模型到 localStorage
  const saveModelsToStorage = useCallback((modelsToSave: Work[]) => {
    try {
      localStorage.setItem("spine-models", JSON.stringify(modelsToSave))
      console.log("[ModelStorage] Saved models to localStorage:", modelsToSave.length)
      return true
    } catch (error) {
      console.error("[ModelStorage] Failed to save to localStorage:", error)
      return false
    }
  }, [])

  // 從遠程 JSON 文件載入默認模型
  const loadDefaultModels = useCallback(async (): Promise<Work[]> => {
    try {
      const response = await fetch("/spine-models.json")
      if (!response.ok) {
        throw new Error(`Failed to load default models: ${response.status}`)
      }
      const config = await response.json()
      console.log("[ModelStorage] Loaded default models:", config.models.length)
      return config.models
    } catch (error) {
      console.error("[ModelStorage] Failed to load default models:", error)
      // 返回硬編碼的默認模型
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
  }, [])

  // 初始化模型列表
  const initializeModels = useCallback(async (): Promise<Work[]> => {
    // 首先嘗試從 localStorage 載入
    const storedModels = loadModelsFromStorage()

    if (storedModels.length > 0) {
      setModels(storedModels)
      return storedModels
    }

    // 如果 localStorage 為空，載入默認模型
    const defaultModels = await loadDefaultModels()
    setModels(defaultModels)

    // 將默認模型保存到 localStorage
    saveModelsToStorage(defaultModels)

    return defaultModels
  }, [loadModelsFromStorage, loadDefaultModels, saveModelsToStorage])

  // 添加新模型
  const addModel = useCallback(
    (newModel: Work): boolean => {
      try {
        const updatedModels = [...models, newModel]
        setModels(updatedModels)
        return saveModelsToStorage(updatedModels)
      } catch (error) {
        console.error("[ModelStorage] Failed to add model:", error)
        return false
      }
    },
    [models, saveModelsToStorage],
  )

  // 編輯模型
  const editModel = useCallback(
    (updatedModel: Work): boolean => {
      try {
        const updatedModels = models.map((model) => (model.id === updatedModel.id ? updatedModel : model))
        setModels(updatedModels)
        return saveModelsToStorage(updatedModels)
      } catch (error) {
        console.error("[ModelStorage] Failed to edit model:", error)
        return false
      }
    },
    [models, saveModelsToStorage],
  )

  // 刪除模型
  const deleteModel = useCallback(
    (modelId: string): boolean => {
      try {
        const updatedModels = models.filter((model) => model.id !== modelId)
        setModels(updatedModels)
        return saveModelsToStorage(updatedModels)
      } catch (error) {
        console.error("[ModelStorage] Failed to delete model:", error)
        return false
      }
    },
    [models, saveModelsToStorage],
  )

  // 導出模型配置（用於下載）
  const exportModels = useCallback((): string => {
    const config = {
      models: models,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }
    return JSON.stringify(config, null, 2)
  }, [models])

  // 導入模型配置
  const importModels = useCallback(
    (configJson: string): boolean => {
      try {
        const config = JSON.parse(configJson)
        if (config.models && Array.isArray(config.models)) {
          setModels(config.models)
          saveModelsToStorage(config.models)
          console.log("[ModelStorage] Imported models:", config.models.length)
          return true
        } else {
          throw new Error("Invalid config format")
        }
      } catch (error) {
        console.error("[ModelStorage] Failed to import models:", error)
        return false
      }
    },
    [saveModelsToStorage],
  )

  // 重置到默認模型
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    try {
      const defaultModels = await loadDefaultModels()
      setModels(defaultModels)
      saveModelsToStorage(defaultModels)
      console.log("[ModelStorage] Reset to default models")
      return true
    } catch (error) {
      console.error("[ModelStorage] Failed to reset to defaults:", error)
      return false
    }
  }, [loadDefaultModels, saveModelsToStorage])

  return {
    models,
    initializeModels,
    addModel,
    editModel,
    deleteModel,
    exportModels,
    importModels,
    resetToDefaults,
  }
}
