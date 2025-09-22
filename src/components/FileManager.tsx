import type React from "react"
import { useRef } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { FiUpload, FiFile, FiFolder, FiShare2, FiX } from "react-icons/fi"
import { FileManagerProps } from "../constants/types"

export function FileManager({
  files,
  connectedDevicesCount,
  onFileSelect,
  onStartAllTransfers,
  onCancelAllTransfers,
  onClearCompletedFiles,
}: FileManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const fakeEvent = { target: { files: droppedFiles } } as unknown as React.ChangeEvent<HTMLInputElement>
    onFileSelect(fakeEvent)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <Card className="p-6 border-border rounded-sm lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <FiUpload className="text-primary" />
        <h2 className="text-xl font-semibold">File Manager</h2>
        <Badge variant="outline" className="ml-auto rounded-sm">
          {files.length} files
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => fileInputRef.current?.click()} className="rounded-sm" variant="outline">
            <FiFile className="w-4 h-4 mr-2" />
            Select Files
          </Button>
          <Button onClick={onClearCompletedFiles} variant="outline" className="rounded-sm bg-transparent">
            <FiFolder className="w-4 h-4 mr-2" />
            Clear Completed
          </Button>
        </div>

        <input ref={fileInputRef} type="file" multiple onChange={onFileSelect} className="hidden" />

        {files.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={onStartAllTransfers}
              className="flex-1 rounded-sm"
              disabled={
                !files.some((f) => f.status === "pending") ||
                connectedDevicesCount === 0
              }
            >
              <FiShare2 className="w-4 h-4 mr-2" />
              Start All Transfers
            </Button>
            <Button
              onClick={onCancelAllTransfers}
              variant="destructive"
              className="flex-1 rounded-sm"
              disabled={!files.some((f) => f.status === "transferring" || f.status === "pending")}
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancel All
            </Button>
          </div>
        )}

        <div className="text-center">
          <Badge
            variant={connectedDevicesCount > 0 ? "default" : "secondary"}
            className="rounded-sm"
          >
            {connectedDevicesCount} device(s) ready to receive
          </Badge>
        </div>

        <div
          className="border-2 border-dashed border-border rounded-sm p-8 text-center hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Drag and drop files here</p>
          <p className="text-xs text-muted-foreground mt-1">or click Select Files button</p>
        </div>
      </div>
    </Card>
  )
}