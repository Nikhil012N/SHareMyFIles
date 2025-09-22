import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { FiPlay, FiX } from "react-icons/fi"
import { formatFileSize } from "../utils/formatter"
import type { TransferQueueProps} from "../constants/types"



export function TransferQueue({ files, onStartFileTransfer, onCancelFileTransfer }: TransferQueueProps) {
  const completedCount = files.filter(f => f.status === "completed").length
  const activeCount = files.filter(f => f.status === "transferring").length
  const cancelledCount = files.filter(f => f.status === "cancelled").length

  return (
    <Card className="mt-6 p-6 border-border rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Transfer Queue</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-sm">
            {completedCount} completed
          </Badge>
          <Badge variant="secondary" className="rounded-sm">
            {activeCount} active
          </Badge>
          <Badge variant="destructive" className="rounded-sm">
            {cancelledCount} cancelled
          </Badge>
        </div>
      </div>
      <div className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="p-4 bg-muted rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{file.name}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  {file.startTime && <span>Started: {file.startTime.toLocaleTimeString()}</span>}
                  {file.endTime && file.startTime && (
                    <span>Duration: {Math.round((file.endTime.getTime() - file.startTime.getTime()) / 1000)}s</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap place-content-end">
                <Badge
                  variant={
                    file.status === "completed"
                      ? "default"
                      : file.status === "transferring"
                        ? "secondary"
                        : file.status === "cancelled"
                          ? "destructive"
                          : "outline"
                  }
                  className="rounded-sm"
                >
                  {file.status}
                </Badge>
                {file.status === "pending" && (
                  <Button size="sm" onClick={() => onStartFileTransfer(file.id)} className="rounded-sm">
                    <FiPlay className="w-3 h-3" />
                  </Button>
                )}
                {(file.status === "transferring" || file.status === "pending") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onCancelFileTransfer(file.id)}
                    className="rounded-sm"
                  >
                    <FiX className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            {file.status === "transferring" && (
              <div className="space-y-1">
                <Progress value={file.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(file.progress)}% complete</span>
                  {file.speed && <span>{formatFileSize(file.speed)}/s</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}