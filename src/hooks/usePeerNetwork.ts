import { useCallback, useEffect, useRef, useState } from "react"
import Peer from "peerjs"
import type { DataConnection } from "peerjs"
import { toast } from "sonner"
import type { ConnectedDevice } from "../constants/types"

export function usePeerNetwork() {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [peerId, setPeerId] = useState<string>("")
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([])
  const [isReconnecting, setIsReconnecting] = useState(false)
  const onDataRef = useRef<((data: unknown, senderId: string) => void) | null>(null)

  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on("open", () => {
      const deviceType = Math.random() > 0.5 ? "desktop" : "mobile"
      const newDevice: ConnectedDevice = {
        id: conn.peer,
        name: `Device ${conn.peer.substring(0, 6)}`,
        type: deviceType,
        connected: true,
        connection: conn,
        lastSeen: new Date(),
        transferSpeed: 0,
        totalTransferred: 0,
      }

      setConnectedDevices((prev) => {
        const existing = prev.find((d) => d.id === conn.peer)
        if (existing) {
          return prev.map((d) => (d.id === conn.peer ? { ...d, connected: true, connection: conn, lastSeen: new Date() } : d))
        }
        return [...prev, newDevice]
      })

      toast.success("New device connected", { description: newDevice.name })
    })

    conn.on("data", (data: unknown) => {
      onDataRef.current?.(data, conn.peer)
    })

    conn.on("close", () => {
      setConnectedDevices((prev) => prev.map((d) => (d.id === conn.peer ? { ...d, connected: false, connection: undefined } : d)))
      toast.info("Device disconnected")
    })

    conn.on("error", (error) => {
      console.error("Connection error:", error)
      toast.error("Connection error with device")
    })
  }, [])

  const initializePeer = useCallback(() => {
    const newPeer = new Peer({
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    })

    newPeer.on("open", (id) => {
      setPeerId(id)
      setPeer(newPeer)
      setIsReconnecting(false)
      toast.success("Connected to network", { description: `Your ID: ${id.substring(0, 8)}...` })
    })

    newPeer.on("connection", (conn) => {
      setupConnection(conn)
    })

    newPeer.on("error", (error) => {
      console.error("Peer error:", error)
      toast.error("Connection error", { description: "Please check your network connection" })
      setIsReconnecting(false)
    })

    newPeer.on("disconnected", () => {
      toast.warning("Disconnected from network", { description: "Attempting to reconnect..." })
      setIsReconnecting(true)
      setTimeout(() => {
        if (newPeer.destroyed) return
        newPeer.reconnect()
      }, 3000)
    })

    return newPeer
  }, [setupConnection])

  useEffect(() => {
    const p = initializePeer()
    return () => {
      if (p && !p.destroyed) {
        p.destroy()
      }
    }
  }, [initializePeer])

  const disconnectDevice = useCallback((deviceId: string) => {
    const device = connectedDevices.find((d) => d.id === deviceId)
    if (device?.connection) {
      device.connection.close()
      toast.success("Device disconnected", { description: device.name })
    }
    setConnectedDevices((prev) => prev.filter((d) => d.id !== deviceId))
  }, [connectedDevices])

  const disconnectAllDevices = useCallback(() => {
    connectedDevices.forEach((device) => device.connection?.close())
    setConnectedDevices([])
    toast.success("All devices disconnected")
  }, [connectedDevices])

  const reconnectToNetwork = useCallback(() => {
    if (peer) {
      peer.destroy()
    }
    setIsReconnecting(true)
    toast.info("Reconnecting to network...")
    setTimeout(() => {
      initializePeer()
    }, 1000)
  }, [peer, initializePeer])

  return {
    peer,
    peerId,
    connectedDevices,
    isReconnecting,
    setupConnection,
    setConnectedDevices,
    disconnectDevice,
    disconnectAllDevices,
    reconnectToNetwork,
    setOnDataHandler: (handler: (data: unknown, senderId: string) => void) => {
      onDataRef.current = handler
    },
  }
}


