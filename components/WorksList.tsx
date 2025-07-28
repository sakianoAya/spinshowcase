"use client"

import { Folder, RefreshCw } from "lucide-react"
import { AddModelDialog } from "./AddModelDialog"
import { SwipeableWorkItem } from "./SwipeableWorkItem"
import { EditModelDialog } from "./EditModelDialog"
import { useState } from "react"
import { motion } from "framer-motion"

interface Work {
  id: string
  name: string
  thumbnail: string
  description: string
  atlasPath: string
  jsonPath: string
  imagePath: string
}

interface WorksListProps {
  works: Work[]
  selectedWork: Work | null
  onWorkChange: (work: Work) => void
  onAddModel: (model: any) => void
  onEditModel: (work: Work) => void
  onDeleteModel: (workId: string) => void
  onExportModels: () => string
  onImportModels: (config: string) => boolean
  onResetModels: () => Promise<boolean>
  isLoading: boolean
}

export function WorksList({
  works,
  selectedWork,
  onWorkChange,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onExportModels,
  onImportModels,
  onResetModels,
  isLoading,
}: WorksListProps) {
  const [editingWork, setEditingWork] = useState<Work | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleEdit = (work: Work) => {
    setEditingWork(work)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (work: Work) => {
    if (confirm(`確定要刪除 "${work.name}" 嗎？`)) {
      onDeleteModel(work.id)
    }
  }

  const handleEditSubmit = (updatedWork: Work) => {
    onEditModel(updatedWork)
    setIsEditDialogOpen(false)
    setEditingWork(null)
  }

  const handleResetToNewModels = async () => {
    if (confirm("重置到新的模型配置？這將載入最新的模型配置並覆蓋當前設置。")) {
      setIsResetting(true)
      try {
        await onResetModels()
      } finally {
        setIsResetting(false)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Folder className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-white font-medium text-lg">Works</h2>
          </div>

          {/* Reset Button */}
          <motion.button
            onClick={handleResetToNewModels}
            disabled={isResetting}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="重置到新的模型配置"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isResetting ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
        <p className="text-gray-400 text-sm">Select an animation to preview</p>
        <div className="mt-2 text-xs text-gray-500">
          {works.length} model{works.length !== 1 ? "s" : ""} • Stored locally
        </div>
      </div>

      {/* Scrollable Works List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="p-4 space-y-3 pb-6">
            {/* Add Model Button */}
            <AddModelDialog onAddModel={onAddModel} isLoading={isLoading} />

            {/* Existing Models */}
            {works.map((work) => (
              <SwipeableWorkItem
                key={work.id}
                work={work}
                selectedWork={selectedWork}
                onWorkChange={onWorkChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            ))}

            {/* Bottom padding for better scrolling */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditModelDialog
        work={editingWork}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditModel={handleEditSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
