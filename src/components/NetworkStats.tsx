import { Card } from "../ui/card"
import { FiUsers, FiActivity, FiDatabase, FiClock } from "react-icons/fi"
import { formatFileSize, formatUptime } from "../utils/formatter"
import type { NetworkStats as NetworkStatsType } from "../constants/types"

interface NetworkStatsProps {
  stats: NetworkStatsType
}

export function NetworkStats({ stats }: NetworkStatsProps) {
  const statItems = [
    { icon: FiUsers, value: stats.totalDevices, label: "Connected" },
    { icon: FiActivity, value: stats.activeTransfers, label: "Active" },
    { icon: FiDatabase, value: formatFileSize(stats.totalDataTransferred), label: "Transferred" },
    { icon: FiClock, value: formatUptime(stats.uptime), label: "Uptime" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4 border-border rounded-sm">
          <div className="flex items-center gap-2">
            <item.icon className="text-primary w-5 h-5" />
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}