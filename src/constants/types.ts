import type { DataConnection } from "peerjs"

export interface ConnectedDevice {
  id: string
  name: string
  type: "desktop" | "mobile"
  connected: boolean
  connection?: DataConnection
  lastSeen?: Date
  transferSpeed?: number
  totalTransferred?: number
}

export interface FileTransfer {
  id: string
  name: string
  size: number
  progress: number
  status: "pending" | "transferring" | "completed" | "cancelled" | "paused"
  recipient?: string
  file?: File
  chunks?: ArrayBuffer[]
  totalChunks?: number
  receivedChunks?: number
  startTime?: Date
  endTime?: Date
  speed?: number
}

export interface NetworkStats {
  totalDevices: number
  activeTransfers: number
  totalDataTransferred: number
  averageSpeed: number
  uptime: number
}
export type IncomingData =
| { type: "file-start"; fileId: string; fileName: string; fileSize: number; totalChunks: number }
| { type: "file-chunk"; fileId: string; chunk: ArrayBuffer; chunkIndex: number }

export interface TransferQueueProps {
  files: FileTransfer[]
  onStartFileTransfer: (fileId: string) => void
  onCancelFileTransfer: (fileId: string) => void
}

export interface ThemeToggleProps {
  isDarkMode: boolean
  setIsDarkMode: (darkMode: boolean) => void
}

export interface NetworkPanelProps {
  peerId: string
  shareUrl: string
  connectId: string
  setConnectId: (id: string) => void
  isConnecting: boolean
  isReconnecting: boolean
  onCopyPeerId: () => void
  onCopyShareUrl: () => void
  onConnectToDevice: () => void
  onReconnectToNetwork: () => void
  onDisconnectAllDevices: () => void
  connectedDevicesCount: number
}

export interface FileManagerProps {
  files: FileTransfer[]
  connectedDevicesCount: number
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onStartAllTransfers: () => void
  onCancelAllTransfers: () => void
  onClearCompletedFiles: () => void
}