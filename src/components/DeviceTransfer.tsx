import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { FiUsers, FiMonitor, FiSmartphone, FiX, FiClock } from "react-icons/fi"
import type { ConnectedDevice } from "../constants/types"

interface DevicesPanelProps {
  devices: ConnectedDevice[]
  onDisconnectDevice: (deviceId: string) => void
}

export function DevicesPanel({ devices, onDisconnectDevice }: DevicesPanelProps) {
  const connectedDevices = devices.filter(d => d.connected)

  return (
    <Card className="p-6 border-border rounded-sm lg:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <FiUsers className="text-primary" />
        <h2 className="text-xl font-semibold">Devices</h2>
        <Badge variant="secondary" className="ml-auto rounded-sm">
          {connectedDevices.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <FiUsers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No devices connected</p>
            <p className="text-xs text-muted-foreground mt-1">Share your URL or connect manually</p>
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="p-3 bg-muted rounded-sm">
              <div className="flex items-center gap-3 mb-2">
                {device.type === "desktop" ? (
                  <FiMonitor className="text-primary" />
                ) : (
                  <FiSmartphone className="text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{device.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{device.id.substring(0, 12)}...</p>
                </div>
                <Badge variant={device.connected ? "default" : "secondary"} className="rounded-sm">
                  {device.connected ? "Online" : "Offline"}
                </Badge>
                {device.connected && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDisconnectDevice(device.id)}
                    className="rounded-sm"
                  >
                    <FiX className="w-3 h-3" />
                  </Button>
                )}
              </div>
              {device.lastSeen && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FiClock className="w-3 h-3" />
                  <span>Last seen: {device.lastSeen.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}