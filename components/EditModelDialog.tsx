"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Edit, AlertCircle, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Work {
  id: string
  name: string
  thumbnail: string
  description: string
  atlasPath: string
  jsonPath: string
  imagePath: string
}

interface EditModelDialogProps {
  work: Work | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditModel: (model: Work) => void
  isLoading?: boolean
}

interface FormData {
  name: string
  description: string
  atlasPath: string
  jsonPath: string
  imagePath: string
  thumbnailPath: string
}

interface FormErrors {
  name?: string
  description?: string
  atlasPath?: string
  jsonPath?: string
  imagePath?: string
  thumbnailPath?: string
}

export function EditModelDialog({ work, open, onOpenChange, onEditModel, isLoading = false }: EditModelDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    atlasPath: "",
    jsonPath: "",
    imagePath: "",
    thumbnailPath: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 當對話框打開或 work 變更時，載入數據
  useEffect(() => {
    if (work && open) {
      setFormData({
        name: work.name,
        description: work.description,
        atlasPath: work.atlasPath,
        jsonPath: work.jsonPath,
        imagePath: work.imagePath,
        thumbnailPath: work.thumbnail,
      })
      setErrors({})
    }
  }, [work, open])

  const validateGithubRawUrl = (url: string, fileExtension: string): boolean => {
    if (!url) return false
    const githubRawPattern = /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/.*\.(atlas|json|png)$/i
    return githubRawPattern.test(url) && url.toLowerCase().endsWith(`.${fileExtension}`)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Model name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Model name must be at least 2 characters"
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    // URL validation
    if (formData.atlasPath && !validateGithubRawUrl(formData.atlasPath, "atlas")) {
      newErrors.atlasPath = "Must be a valid GitHub raw URL ending with .atlas"
    }

    if (formData.jsonPath && !validateGithubRawUrl(formData.jsonPath, "json")) {
      newErrors.jsonPath = "Must be a valid GitHub raw URL ending with .json"
    }

    if (formData.imagePath && !validateGithubRawUrl(formData.imagePath, "png")) {
      newErrors.imagePath = "Must be a valid GitHub raw URL ending with .png"
    }

    if (formData.thumbnailPath && !validateGithubRawUrl(formData.thumbnailPath, "png")) {
      newErrors.thumbnailPath = "Must be a valid GitHub raw URL ending with .png"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    if (!work || !validateForm()) return

    setIsSubmitting(true)
    try {
      const updatedModel: Work = {
        ...work,
        name: formData.name.trim(),
        description: formData.description.trim(),
        atlasPath: formData.atlasPath,
        jsonPath: formData.jsonPath,
        imagePath: formData.imagePath,
        thumbnail: formData.thumbnailPath,
      }

      await onEditModel(updatedModel)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to edit model:", error)
    } finally {
      setIsSubmitting(false)
    }
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

  if (!work) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#1a1a1a] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-5 h-5 text-blue-400" />
            Edit Spine Model
          </DialogTitle>
          <DialogDescription className="text-gray-400">Edit the model information and file URLs</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-gray-300">
              Model Name *
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter model name..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-gray-300">
              Description *
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the model..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[80px]"
            />
            {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnailPath" className="text-gray-300">
              Thumbnail URL (.png)
            </Label>
            <div className="relative">
              <Input
                id="edit-thumbnailPath"
                value={formData.thumbnailPath}
                onChange={(e) => handleInputChange("thumbnailPath", e.target.value)}
                placeholder="https://raw.githubusercontent.com/user/repo/branch/thumbnail.png"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {formData.thumbnailPath && getUrlValidationIcon(formData.thumbnailPath, "png")}
              </div>
            </div>
            {errors.thumbnailPath && <p className="text-red-400 text-sm">{errors.thumbnailPath}</p>}
          </div>

          {/* Atlas URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-atlasPath" className="text-gray-300">
              Atlas File URL (.atlas)
            </Label>
            <div className="relative">
              <Input
                id="edit-atlasPath"
                value={formData.atlasPath}
                onChange={(e) => handleInputChange("atlasPath", e.target.value)}
                placeholder="https://raw.githubusercontent.com/user/repo/branch/file.atlas"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {formData.atlasPath && getUrlValidationIcon(formData.atlasPath, "atlas")}
              </div>
            </div>
            {errors.atlasPath && <p className="text-red-400 text-sm">{errors.atlasPath}</p>}
          </div>

          {/* JSON URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-jsonPath" className="text-gray-300">
              JSON File URL (.json)
            </Label>
            <div className="relative">
              <Input
                id="edit-jsonPath"
                value={formData.jsonPath}
                onChange={(e) => handleInputChange("jsonPath", e.target.value)}
                placeholder="https://raw.githubusercontent.com/user/repo/branch/file.json"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {formData.jsonPath && getUrlValidationIcon(formData.jsonPath, "json")}
              </div>
            </div>
            {errors.jsonPath && <p className="text-red-400 text-sm">{errors.jsonPath}</p>}
          </div>

          {/* PNG URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-imagePath" className="text-gray-300">
              PNG File URL (.png)
            </Label>
            <div className="relative">
              <Input
                id="edit-imagePath"
                value={formData.imagePath}
                onChange={(e) => handleInputChange("imagePath", e.target.value)}
                placeholder="https://raw.githubusercontent.com/user/repo/branch/file.png"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {formData.imagePath && getUrlValidationIcon(formData.imagePath, "png")}
              </div>
            </div>
            {errors.imagePath && <p className="text-red-400 text-sm">{errors.imagePath}</p>}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
