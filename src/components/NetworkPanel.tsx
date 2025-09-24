import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import {
  FiWifi,
  FiCopy,
  FiLink,
  FiWifiOff,
  FiRefreshCw,
  FiSend,
  FiShield,
} from "react-icons/fi"
import type { NetworkPanelProps } from "../constants/types"



export function NetworkPanel({
  peerId,
  shareUrl,
  connectId,
  setConnectId,
  isConnecting,
  isReconnecting,
  onCopyPeerId,
  onCopyShareUrl,
  onConnectToDevice,
  onReconnectToNetwork,
  onDisconnectAllDevices,
  connectedDevicesCount,
}: NetworkPanelProps) {
  return (
    <Card className="p-6 border-border rounded-sm lg:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <FiWifi className="text-primary" />
        <h2 className="text-xl font-semibold">Network</h2>
        <Badge variant={!isReconnecting ? "default" : "secondary"} className="ml-auto rounded-sm">
          {isReconnecting ? "Reconnecting..." : "Online"}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Your Device ID</label>
          <div className="flex gap-2">
            <Input value={peerId} readOnly className="border rounded-sm font-mono text-sm" />
            <Button onClick={onCopyPeerId} size="sm" variant="outline" className="rounded-sm bg-transparent">
              <FiCopy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Quick Share URL</label>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="rounded-sm font-mono text-xs" />
            <Button onClick={onCopyShareUrl} size="sm" variant="outline" className="rounded-sm bg-transparent">
              <FiLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Share this URL for instant connection</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Connect to Device</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter device ID"
              value={connectId}
              onChange={(e) => setConnectId(e.target.value)}
              className="rounded-sm"
              onKeyPress={(e) => e.key === "Enter" && onConnectToDevice()}
            />
            <Button
              onClick={onConnectToDevice}
              disabled={isConnecting || !connectId.trim()}
              className="rounded-sm"
            >
              {isConnecting ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={onReconnectToNetwork}
            variant="outline"
            className="flex-1 rounded-sm bg-transparent"
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FiWifi className="w-4 h-4 mr-2" />
            )}
            {isReconnecting ? "Reconnecting..." : "Reconnect"}
          </Button>
          {connectedDevicesCount > 0 && (
            <Button onClick={onDisconnectAllDevices} variant="outline" className="flex-1 rounded-sm bg-transparent">
              <FiWifiOff className="w-4 h-4 mr-2" />
              Disconnect All
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted rounded-sm">
          <FiShield className="text-primary w-4 h-4" />
          <div className="flex-1">
            <p className="text-sm font-medium">Secure P2P Connection</p>
            <p className="text-xs text-muted-foreground">End-to-end encrypted transfers</p>
          </div>
        </div>
      </div>
    </Card>
  )
}