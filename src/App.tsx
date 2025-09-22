import { useEffect, useMemo, useState } from "react"
import { useTheme } from "./hooks/useTheme"
import { usePeerNetwork } from "./hooks/usePeerNetwork"
import { useTransfers } from "./hooks/useTransfers"
import { NetworkStats as NetworkStatsComponent } from "./components/NetworkStats"
import { NetworkPanel } from "./components/NetworkPanel"
import { FileManager } from "./components/FileManager"
import { DevicesPanel } from "./components/DeviceTransfer"
import type { FileTransfer, IncomingData } from "./constants/types"
import { TransferQueue } from "./components/TransferQueue"
import { ThemeToggle } from "./components/ThemeToogle"
import { toast } from "sonner"


export default function FileShareApp() {
  const { isDarkMode, setIsDarkMode } = useTheme(true)
  const {
    peer,
    peerId,
    connectedDevices,
    isReconnecting,
    setupConnection,
    disconnectDevice,
    disconnectAllDevices,
    reconnectToNetwork,
    setOnDataHandler,
  } = usePeerNetwork()

  const {
    files,
    setFiles,
    networkStats,
    handleFileSelect,
    startFileTransfer,
    cancelFileTransfer,
    cancelAllTransfers,
    clearCompletedFiles,
  } = useTransfers(connectedDevices)

  const [connectId, setConnectId] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const connectedDevicesCount = useMemo(() => connectedDevices.filter((d) => d.connected).length, [connectedDevices])

  useEffect(() => {
    if (!peerId) return
    const baseUrl = window.location.origin + window.location.pathname
    setShareUrl(`${baseUrl}?connect=${peerId}`)
  }, [peerId])

  useEffect(() => {
    setOnDataHandler((data) => {
      const d = data as IncomingData
      if (d.type === "file-start") {
        const newFile: FileTransfer = {
          id: d.fileId,
          name: d.fileName,
          size: d.fileSize,
          progress: 0,
          status: "transferring",
          chunks: [],
          totalChunks: d.totalChunks,
          receivedChunks: 0,
          startTime: new Date(),
        }
        setFiles((prev) => [...prev, newFile])
      } else if (d.type === "file-chunk") {
        setFiles((prev) =>
          prev.map((file) => {
            if (file.id === d.fileId) {
              const newChunks = [...(file.chunks || []), d.chunk]
              const receivedChunks = (file.receivedChunks || 0) + 1
              const progress = (receivedChunks / (file.totalChunks || 1)) * 100
              if (receivedChunks === file.totalChunks) {
                const blob = new Blob(newChunks)
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = file.name
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                return { ...file, progress: 100, status: "completed", chunks: newChunks, receivedChunks, endTime: new Date() }
              }
              return { ...file, progress, chunks: newChunks, receivedChunks }
            }
            return file
          }),
        )
      } else if (d.type === "file-cancel") {
        // Handle incoming cancel message
        setFiles((prev) => prev.map((f) => (f.id === d.fileId ? { ...f, status: "cancelled" } : f)))
        toast.info("File transfer cancelled by sender")
      } else if (d.type === "file-cancel-all") {
        // Handle cancel all message
        setFiles((prev) => prev.map((f) => (f.status === "transferring" || f.status === "pending" ? { ...f, status: "cancelled" } : f)))
        toast.info("All transfers cancelled by sender")
      }
    })
  }, [setOnDataHandler, setFiles])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const connectParam = urlParams.get("connect")
    if (connectParam && peer && peerId && connectParam !== peerId) {
      setConnectId(connectParam)
      setTimeout(() => {
        connectToDevice(connectParam)
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer, peerId])

  const connectToDevice = async (targetId?: string) => {
    const idToConnect = (targetId || connectId).trim()
    if (!peer || !idToConnect || idToConnect === peerId) return
    setIsConnecting(true)
    try {
      const conn = peer.connect(idToConnect, { reliable: true })
      setupConnection(conn)
      conn.on("open", () => {
        if (!targetId) setConnectId("")
        setIsConnecting(false)
      })
      conn.on("error", () => setIsConnecting(false))
      setTimeout(() => setIsConnecting(false), 15000)
    } catch {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-semibold text-primary dark:text-white mb-4" >SHare My FIles</h1>
           
          </div>
        <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>
        </div>

        <NetworkStatsComponent stats={networkStats} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <NetworkPanel
            peerId={peerId}
            shareUrl={shareUrl}
            connectId={connectId}
            setConnectId={setConnectId}
            isConnecting={isConnecting}
            isReconnecting={isReconnecting}
            onCopyPeerId={() => {navigator.clipboard.writeText(peerId);
              toast.success("Peer ID copied to clipboard")
            }}
            onCopyShareUrl={() => {navigator.clipboard.writeText(shareUrl);
              toast.success("Share URL copied to clipboard")
            }}
            onConnectToDevice={() => connectToDevice()}
            onReconnectToNetwork={reconnectToNetwork}
            onDisconnectAllDevices={disconnectAllDevices}
            connectedDevicesCount={connectedDevicesCount}
          />

          <FileManager
            files={files}
            connectedDevicesCount={connectedDevicesCount}
            onFileSelect={handleFileSelect}
            onStartAllTransfers={() => files.forEach((f) => f.status === "pending" && startFileTransfer(f.id))}
            onCancelAllTransfers={cancelAllTransfers}
            onClearCompletedFiles={clearCompletedFiles}
          />

          <DevicesPanel devices={connectedDevices} onDisconnectDevice={disconnectDevice} />
        </div>

        {files.length > 0 && (
          <TransferQueue
            files={files}
            onStartFileTransfer={startFileTransfer}
            onCancelFileTransfer={cancelFileTransfer}
          />
        )}
      </div>
    </div>
  )
}
