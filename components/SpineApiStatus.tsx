"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

interface SpineApiStatusProps {
  spineApiInfo: string[]
}

export function SpineApiStatus({ spineApiInfo }: SpineApiStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          Spine API 狀態
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
          {spineApiInfo.length === 0 ? (
            <div className="text-gray-500">等待 API 檢查...</div>
          ) : (
            spineApiInfo.map((info, index) => (
              <div key={index} className={info.startsWith("✓") ? "text-green-600" : "text-red-600"}>
                {info}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
