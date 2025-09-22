import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { ConnectedDevice, FileTransfer, NetworkStats } from "../constants/types"
import { CHUNK_SIZE } from "../constants/constant"


export function useTransfers(connectedDevices: ConnectedDevice[]) {
  const [files, setFiles] = useState<FileTransfer[]>([])
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalDevices: 0,
    activeTransfers: 0,
    totalDataTransferred: 0,
    averageSpeed: 0,
    uptime: 0,
  })
  const [startTime] = useState(new Date())
  const transferIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const cancelledTransfers = useRef<Set<string>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats((prev) => ({
        ...prev,
        totalDevices: connectedDevices.filter((d) => d.connected).length,
        activeTransfers: files.filter((f) => f.status === "transferring").length,
        uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [connectedDevices, files, startTime])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const newFiles: FileTransfer[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending",
      file,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`${selectedFiles.length} file(s) added`)
  }, [])

  const startFileTransfer = useCallback(async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file || !file.file) return

    const availableDevices = connectedDevices.filter((d) => d.connected && d.connection)
    if (availableDevices.length === 0) {
      toast.error("No connected devices available")
      return
    }

    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "transferring", startTime: new Date() } : f)))

    try {
      const fileBuffer = await file.file.arrayBuffer()
      const totalChunks = Math.ceil(fileBuffer.byteLength / CHUNK_SIZE)
      // notify all devices of incoming file
      availableDevices.forEach((device) => {
        device.connection?.send({
          type: "file-start",
          fileId: file.id,
          fileName: file.name,
          fileSize: file.size,
          totalChunks,
        })
      })

      let chunkIndex = 0
      const sendChunk = () => {
        if (cancelledTransfers.current.has(fileId)) {
          // stop sending if cancelled
          const t = transferIntervals.current.get(fileId)
          if (t) clearTimeout(t)
          transferIntervals.current.delete(fileId)
          return
        }

        if (chunkIndex < totalChunks) {
          const start = chunkIndex * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, fileBuffer.byteLength)
          const chunk = fileBuffer.slice(start, end)

          // broadcast this chunk to all connected devices
          availableDevices.forEach((device) => {
            device.connection?.send({ type: "file-chunk", fileId: file.id, chunkIndex, chunk })
          })

          chunkIndex++
          const progress = (chunkIndex / totalChunks) * 100
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))

          if (chunkIndex < totalChunks) {
            const timeoutId = setTimeout(sendChunk, 10)
            transferIntervals.current.set(fileId, timeoutId)
          } else {
            transferIntervals.current.delete(fileId)
            setFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, status: "completed", progress: 100, endTime: new Date() } : f)),
            )
            toast.success(`${file.name} sent successfully`)
          }
        }
      }

      const firstTimeout = setTimeout(sendChunk, 0)
      transferIntervals.current.set(fileId, firstTimeout)
    } catch (error) {
      console.error("File transfer error:", error)
      toast.error("File transfer failed")
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "cancelled" } : f)))
    }
  }, [files, connectedDevices])

  const cancelFileTransfer = useCallback((fileId: string) => {
    cancelledTransfers.current.add(fileId)
    const timeoutId = transferIntervals.current.get(fileId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      transferIntervals.current.delete(fileId)
    }
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "cancelled" } : f)))
    toast.info("File transfer cancelled")
  }, [])

  const cancelAllTransfers = useCallback(() => {
    transferIntervals.current.forEach((t) => clearTimeout(t))
    transferIntervals.current.clear()
    cancelledTransfers.current = new Set(files.filter(f => f.status === "transferring" || f.status === "pending").map(f => f.id))
    setFiles((prev) => prev.map((f) => (f.status === "transferring" || f.status === "pending" ? { ...f, status: "cancelled" } : f)))
    toast.info("All transfers cancelled")
  }, [])

  const clearCompletedFiles = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== "completed"))
    toast.success("Completed files cleared")
  }, [])

  return {
    files,
    setFiles,
    networkStats,
    setNetworkStats,
    handleFileSelect,
    startFileTransfer,
    cancelFileTransfer,
    cancelAllTransfers,
    clearCompletedFiles,
  }
}


