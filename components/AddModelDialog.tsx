"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Github, AlertCircle, CheckCircle, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AddModelDialogProps {
  onAddModel: (model: any) => void
  isLoading?: boolean
}

// 修改 FormData 接口，添加縮圖字段
interface FormData {
  name: string
  description: string
  atlasPath: string
  jsonPath: string
  imagePath: string
  thumbnailPath: string // 新增縮圖 URL
  atlasFile: File | null
  jsonFile: File | null
  imageFile: File | null
  thumbnailFile: File | null // 新增縮圖文件
}

// 修改 FormErrors 接口
interface FormErrors {
  name?: string
  description?: string
  atlasPath?: string
  jsonPath?: string
  imagePath?: string
  thumbnailPath?: string // 新增
  atlasFile?: string
  jsonFile?: string
  imageFile?: string
  thumbnailFile?: string // 新增
}

export function AddModelDialog({ onAddModel, isLoading = false }: AddModelDialogProps) {
  const [open, setOpen] = useState(false)
  // 修改 useState 初始值，添加縮圖字段
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    atlasPath: "",
    jsonPath: "",
    imagePath: "",
    thumbnailPath: "", // 新增
    atlasFile: null,
    jsonFile: null,
    imageFile: null,
    thumbnailFile: null, // 新增
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateGithubRawUrl = (url: string, fileExtension: string): boolean => {
    if (!url) return false
    const githubRawPattern = /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/.*\.(atlas|json|png)$/i
    return githubRawPattern.test(url) && url.toLowerCase().endsWith(`.${fileExtension}`)
  }

  // 修改 validateForm 函數，添加縮圖驗證
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Model name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Model name must be at least 2 characters"
    } else if (/[<>:"/\\|?*]/.test(formData.name)) {
      newErrors.name = 'Name cannot contain special characters: < > : " / \\ | ? *'
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    // URL or File validation for Atlas
    if (!formData.atlasPath && !formData.atlasFile) {
      newErrors.atlasPath = "Either provide a URL or upload an atlas file"
    } else if (formData.atlasPath && !validateGithubRawUrl(formData.atlasPath, "atlas")) {
      newErrors.atlasPath = "Must be a valid GitHub raw URL ending with .atlas"
    }

    // URL or File validation for JSON
    if (!formData.jsonPath && !formData.jsonFile) {
      newErrors.jsonPath = "Either provide a URL or upload a JSON file"
    } else if (formData.jsonPath && !validateGithubRawUrl(formData.jsonPath, "json")) {
      newErrors.jsonPath = "Must be a valid GitHub raw URL ending with .json"
    }

    // URL or File validation for PNG
    if (!formData.imagePath && !formData.imageFile) {
      newErrors.imagePath = "Either provide a URL or upload a PNG file"
    } else if (formData.imagePath && !validateGithubRawUrl(formData.imagePath, "png")) {
      newErrors.imagePath = "Must be a valid GitHub raw URL ending with .png"
    }

    // URL or File validation for Thumbnail
    if (!formData.thumbnailPath && !formData.thumbnailFile) {
      newErrors.thumbnailPath = "Either provide a URL or upload a thumbnail file"
    } else if (formData.thumbnailPath && !validateGithubRawUrl(formData.thumbnailPath, "png")) {
      newErrors.thumbnailPath = "Must be a valid GitHub raw URL ending with .png"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // 添加文件處理函數，包含縮圖文件
  const handleFileChange = (field: "atlasFile" | "jsonFile" | "imageFile" | "thumbnailFile", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))

    // 清除相應的 URL 字段和錯誤
    if (field === "atlasFile" && file) {
      setFormData((prev) => ({ ...prev, atlasPath: "" }))
      setErrors((prev) => ({ ...prev, atlasPath: undefined }))
    } else if (field === "jsonFile" && file) {
      setFormData((prev) => ({ ...prev, jsonPath: "" }))
      setErrors((prev) => ({ ...prev, jsonPath: undefined }))
    } else if (field === "imageFile" && file) {
      setFormData((prev) => ({ ...prev, imagePath: "" }))
      setErrors((prev) => ({ ...prev, imagePath: undefined }))
    } else if (field === "thumbnailFile" && file) {
      setFormData((prev) => ({ ...prev, thumbnailPath: "" }))
      setErrors((prev) => ({ ...prev, thumbnailPath: undefined }))
    }
  }

  // 修改 handleSubmit 函數，處理縮圖上傳
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // 創建安全的文件夾名稱
      const folderName = formData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")

      // 處理文件上傳
      let atlasUrl = formData.atlasPath
      let jsonUrl = formData.jsonPath
      let imageUrl = formData.imagePath
      let thumbnailUrl = formData.thumbnailPath // 新增

      // 如果有文件上傳，則處理文件
      if (formData.atlasFile || formData.jsonFile || formData.imageFile || formData.thumbnailFile) {
        // 在實際應用中，這裡應該調用後端 API 來處理文件上傳
        // 這裡我們模擬文件上傳成功，並生成本地路徑

        if (formData.atlasFile) {
          atlasUrl = `/assets/${folderName}/${formData.atlasFile.name}`
          addLog(`Atlas file would be uploaded to: ${atlasUrl}`)
        }

        if (formData.jsonFile) {
          jsonUrl = `/assets/${folderName}/${formData.jsonFile.name}`
          addLog(`JSON file would be uploaded to: ${jsonUrl}`)
        }

        if (formData.imageFile) {
          imageUrl = `/assets/${folderName}/${formData.imageFile.name}`
          addLog(`Image file would be uploaded to: ${imageUrl}`)
        }

        if (formData.thumbnailFile) {
          thumbnailUrl = `/assets/${folderName}/${formData.thumbnailFile.name}`
          addLog(`Thumbnail file would be uploaded to: ${thumbnailUrl}`)
        }
      }

      const newModel = {
        id: folderName,
        name: formData.name.trim(),
        description: formData.description.trim(),
        thumbnail: thumbnailUrl || imageUrl, // 使用縮圖 URL，如果沒有則使用圖像 URL
        atlasPath: atlasUrl,
        jsonPath: jsonUrl,
        imagePath: imageUrl,
      }

      await onAddModel(newModel)

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        atlasPath: "",
        jsonPath: "",
        imagePath: "",
        thumbnailPath: "",
        atlasFile: null,
        jsonFile: null,
        imageFile: null,
        thumbnailFile: null,
      })
      setErrors({})
      setOpen(false)
    } catch (error) {
      console.error("Failed to add model:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 添加 addLog 函數，用於記錄文件上傳過程
  const addLog = (message: string) => {
    console.log(`[AddModel] ${message}`)
  }

  const getUrlValidationIcon = (url: string, extension: string) => {
    if (!url) return null
    const isValid = validateGithubRawUrl(url, extension)
    return isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="w-full p-4 border-2 border-dashed border-gray-700 rounded-xl text-center hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 group-hover:bg-emerald-500/20 rounded-lg flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <p className="text-gray-300 group-hover:text-emerald-400 font-medium transition-colors">Add New Model</p>
              <p className="text-gray-500 text-sm">Import from GitHub</p>
            </div>
          </div>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#1a1a1a] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Github className="w-5 h-5 text-emerald-400" />
            Add New Spine Model
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Import a Spine model from GitHub raw URLs. All file URLs must be from raw.githubusercontent.com
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Model Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter model name..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the model..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[80px]"
            />
            {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
          </div>

          {/* Thumbnail URL - 新增 */}
          <div className="space-y-2">
            <Label htmlFor="thumbnailPath" className="text-gray-300">
              Thumbnail * (.png)
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <Input
                  id="thumbnailPath"
                  value={formData.thumbnailPath}
                  onChange={(e) => handleInputChange("thumbnailPath", e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/branch/thumbnail.png"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                  disabled={!!formData.thumbnailFile}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.thumbnailPath && getUrlValidationIcon(formData.thumbnailPath, "png")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">OR</span>
                <div className="flex-1 relative">
                  <label className="flex items-center justify-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors w-full overflow-hidden">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleFileChange("thumbnailFile", e.target.files?.[0] || null)}
                    />
                    <span className="text-gray-300 text-sm truncate">
                      {formData.thumbnailFile ? formData.thumbnailFile.name : "Upload Thumbnail"}
                    </span>
                  </label>
                  {formData.thumbnailFile && (
                    <button
                      type="button"
                      onClick={() => handleFileChange("thumbnailFile", null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {errors.thumbnailPath && <p className="text-red-400 text-sm">{errors.thumbnailPath}</p>}
          </div>

          {/* Atlas URL */}
          <div className="space-y-2">
            <Label htmlFor="atlasPath" className="text-gray-300">
              Atlas File * (.atlas)
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <Input
                  id="atlasPath"
                  value={formData.atlasPath}
                  onChange={(e) => handleInputChange("atlasPath", e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/branch/file.atlas"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                  disabled={!!formData.atlasFile}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.atlasPath && getUrlValidationIcon(formData.atlasPath, "atlas")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">OR</span>
                <div className="flex-1 relative">
                  <label className="flex items-center justify-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors w-full overflow-hidden">
                    <input
                      type="file"
                      accept=".atlas"
                      className="hidden"
                      onChange={(e) => handleFileChange("atlasFile", e.target.files?.[0] || null)}
                    />
                    <span className="text-gray-300 text-sm truncate">
                      {formData.atlasFile ? formData.atlasFile.name : "Upload Atlas File"}
                    </span>
                  </label>
                  {formData.atlasFile && (
                    <button
                      type="button"
                      onClick={() => handleFileChange("atlasFile", null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {errors.atlasPath && <p className="text-red-400 text-sm">{errors.atlasPath}</p>}
          </div>

          {/* JSON URL */}
          <div className="space-y-2">
            <Label htmlFor="jsonPath" className="text-gray-300">
              JSON File * (.json)
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <Input
                  id="jsonPath"
                  value={formData.jsonPath}
                  onChange={(e) => handleInputChange("jsonPath", e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/branch/file.json"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                  disabled={!!formData.jsonFile}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.jsonPath && getUrlValidationIcon(formData.jsonPath, "json")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">OR</span>
                <div className="flex-1 relative">
                  <label className="flex items-center justify-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors w-full overflow-hidden">
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => handleFileChange("jsonFile", e.target.files?.[0] || null)}
                    />
                    <span className="text-gray-300 text-sm truncate">
                      {formData.jsonFile ? formData.jsonFile.name : "Upload JSON File"}
                    </span>
                  </label>
                  {formData.jsonFile && (
                    <button
                      type="button"
                      onClick={() => handleFileChange("jsonFile", null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {errors.jsonPath && <p className="text-red-400 text-sm">{errors.jsonPath}</p>}
          </div>

          {/* PNG URL */}
          <div className="space-y-2">
            <Label htmlFor="imagePath" className="text-gray-300">
              PNG File * (.png)
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <Input
                  id="imagePath"
                  value={formData.imagePath}
                  onChange={(e) => handleInputChange("imagePath", e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/branch/file.png"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                  disabled={!!formData.imageFile}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.imagePath && getUrlValidationIcon(formData.imagePath, "png")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">OR</span>
                <div className="flex-1 relative">
                  <label className="flex items-center justify-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors w-full overflow-hidden">
                    <input
                      type="file"
                      accept=".png"
                      className="hidden"
                      onChange={(e) => handleFileChange("imageFile", e.target.files?.[0] || null)}
                    />
                    <span className="text-gray-300 text-sm truncate">
                      {formData.imageFile ? formData.imageFile.name : "Upload PNG File"}
                    </span>
                  </label>
                  {formData.imageFile && (
                    <button
                      type="button"
                      onClick={() => handleFileChange("imageFile", null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {errors.imagePath && <p className="text-red-400 text-sm">{errors.imagePath}</p>}
          </div>

          {/* URL Format Help */}
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <h4 className="text-gray-300 font-medium mb-1 flex items-center gap-2 text-sm">
              <Github className="w-4 h-4" />
              File Upload & URL Format
            </h4>
            <p className="text-gray-400 text-xs mb-1">You can either:</p>
            <ul className="text-gray-400 text-xs list-disc pl-4 space-y-1 mb-1">
              <li>
                Upload files directly (stored in{" "}
                <code className="text-emerald-400 bg-gray-900 px-1 rounded text-xs">
                  /assets/{formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "model-name"}/
                </code>
                )
              </li>
              <li>Provide GitHub raw URLs in this format:</li>
            </ul>
            <code className="text-emerald-400 text-xs bg-gray-900 px-2 py-1 rounded block overflow-x-auto whitespace-nowrap">
              https://raw.githubusercontent.com/username/repository/branch/path/file.ext
            </code>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? "Adding..." : "Add Model"}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
