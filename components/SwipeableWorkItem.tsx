"use client"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { Edit, Trash2, Play } from "lucide-react"

interface Work {
  id: string
  name: string
  thumbnail: string
  description: string
  atlasPath: string
  jsonPath: string
  imagePath: string
}

interface SwipeableWorkItemProps {
  work: Work
  selectedWork: Work | null
  onWorkChange: (work: Work) => void
  onEdit: (work: Work) => void
  onDelete: (work: Work) => void
  isLoading: boolean
}

const ACTION_WIDTH = 80 // 每個按鈕的寬度
const ACTIONS_WIDTH = ACTION_WIDTH * 2 // 總操作區域寬度

export function SwipeableWorkItem({
  work,
  selectedWork,
  onWorkChange,
  onEdit,
  onDelete,
  isLoading,
}: SwipeableWorkItemProps) {
  const x = useMotionValue(0)

  // 根據拖動距離變換背景按鈕的縮放和透明度
  const actionContainerScale = useTransform(x, [0, -ACTIONS_WIDTH], [0.8, 1])
  const actionContainerOpacity = useTransform(x, [0, -ACTIONS_WIDTH / 2], [0, 1])

  const handleDragEnd = (event: any, info: any) => {
    const { offset, velocity } = info
    if (offset.x < -ACTIONS_WIDTH / 2 || velocity.x < -500) {
      // 滑動超過一半或速度夠快，則完全打開
      animate(x, -ACTIONS_WIDTH, { type: "spring", stiffness: 300, damping: 30 })
    } else {
      // 否則，彈回原位
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
    }
  }

  const handleAction = (action: (work: Work) => void) => {
    action(work)
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
  }

  const handleClick = () => {
    // 如果滑動菜單是打開的，則不觸發選擇事件
    if (x.get() !== 0) {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
      return
    }
    onWorkChange(work)
  }

  // 安全檢查 selectedWork 是否為 null
  const isSelected = selectedWork?.id === work.id

  return (
    <div className="relative mb-3 rounded-xl overflow-hidden">
      {/* 背景層 - 操作按鈕 */}
      <motion.div
        className="absolute inset-0 flex justify-end"
        style={{
          scale: actionContainerScale,
          opacity: actionContainerOpacity,
        }}
      >
        <button
          onClick={() => handleAction(onEdit)}
          className="w-20 h-full bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center text-white transition-colors"
        >
          <Edit className="w-5 h-5" />
          <span className="text-xs mt-1">編輯</span>
        </button>
        <button
          onClick={() => handleAction(onDelete)}
          className="w-20 h-full bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center text-white transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-xs mt-1">刪除</span>
        </button>
      </motion.div>

      {/* 前景層 - 可滑動的內容 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTIONS_WIDTH, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={handleClick}
        className={`relative z-10 p-4 border rounded-xl transition-all duration-200 ${
          isSelected
            ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
            : "bg-gray-800/50 border-gray-700"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-800 hover:border-gray-600"}`}
      >
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={work.thumbnail || "/placeholder.svg"}
              alt={work.name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const placeholder = target.nextElementSibling as HTMLElement
                if (placeholder) {
                  placeholder.classList.remove("hidden")
                }
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center">
              <Play className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium mb-1 ${isSelected ? "text-emerald-400" : "text-white"}`}>{work.name}</h3>
            <p className="text-gray-400 text-sm line-clamp-1">{work.description}</p>
          </div>

          {/* Status Indicator */}
          {isSelected && <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>}
        </div>
      </motion.div>
    </div>
  )
}
